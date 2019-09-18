package handlers

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/dnote/dnote/pkg/assert"
	"github.com/dnote/dnote/pkg/clock"
	"github.com/dnote/dnote/pkg/server/database"
	"github.com/dnote/dnote/pkg/server/mailer"
	"github.com/dnote/dnote/pkg/server/testutils"
	"golang.org/x/crypto/bcrypt"
)

func init() {
	testutils.InitTestDB()

}

func TestUpdatePassword(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		user := testutils.SetupUserData()
		testutils.SetupAccountData(user, "sung@dnote.io", "oldpassword")

		// Execute
		dat := `{"old_password": "oldpassword", "new_password": "newpassword"}`
		req := testutils.MakeReq(server, "PATCH", "/account/password", dat)
		res := testutils.HTTPAuthDo(t, req, user)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusOK, "Status code mismsatch")

		var account database.Account
		testutils.MustExec(t, db.Where("user_id = ?", user.ID).First(&account), "finding account")

		passwordErr := bcrypt.CompareHashAndPassword([]byte(account.Password.String), []byte("newpassword"))
		assert.Equal(t, passwordErr, nil, "Password mismatch")
	})

	t.Run("old password mismatch", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		u := testutils.SetupUserData()
		a := testutils.SetupAccountData(u, "sung@dnote.io", "oldpassword")

		// Execute
		dat := `{"old_password": "randompassword", "new_password": "newpassword"}`
		req := testutils.MakeReq(server, "PATCH", "/account/password", dat)
		res := testutils.HTTPAuthDo(t, req, u)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusUnauthorized, "Status code mismsatch")

		var account database.Account
		testutils.MustExec(t, db.Where("user_id = ?", u.ID).First(&account), "finding account")
		assert.Equal(t, a.Password.String, account.Password.String, "password should not have been updated")
	})

	t.Run("password too short", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		u := testutils.SetupUserData()
		a := testutils.SetupAccountData(u, "sung@dnote.io", "oldpassword")

		// Execute
		dat := `{"old_password": "oldpassword", "new_password": "a"}`
		req := testutils.MakeReq(server, "PATCH", "/account/password", dat)
		res := testutils.HTTPAuthDo(t, req, u)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusBadRequest, "Status code mismsatch")

		var account database.Account
		testutils.MustExec(t, db.Where("user_id = ?", u.ID).First(&account), "finding account")
		assert.Equal(t, a.Password.String, account.Password.String, "password should not have been updated")
	})
}

func TestCreateVerificationToken(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup

		// TODO: send emails in the background using job queue to avoid coupling the
		// handler itself to the mailer
		templatePath := fmt.Sprintf("%s/mailer/templates/src", testutils.ServerPath)
		mailer.InitTemplates(&templatePath)

		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		user := testutils.SetupUserData()
		testutils.SetupAccountData(user, "sung@dnote.io", "pass1234")

		// Execute
		req := testutils.MakeReq(server, "POST", "/verification-token", "")
		res := testutils.HTTPAuthDo(t, req, user)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusCreated, "status code mismatch")

		var account database.Account
		var token database.Token
		var tokenCount int
		testutils.MustExec(t, db.Where("user_id = ?", user.ID).First(&account), "finding account")
		testutils.MustExec(t, db.Where("user_id = ? AND type = ?", user.ID, database.TokenTypeEmailVerification).First(&token), "finding token")
		testutils.MustExec(t, db.Model(&database.Token{}).Count(&tokenCount), "counting token")

		assert.Equal(t, account.EmailVerified, false, "email_verified should not have been updated")
		assert.NotEqual(t, token.Value, "", "token Value mismatch")
		assert.Equal(t, tokenCount, 1, "token count mismatch")
		assert.Equal(t, token.UsedAt, (*time.Time)(nil), "token UsedAt mismatch")
	})

	t.Run("already verified", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		user := testutils.SetupUserData()
		a := testutils.SetupAccountData(user, "sung@dnote.io", "pass1234")
		a.EmailVerified = true
		testutils.MustExec(t, db.Save(&a), "preparing account")

		// Execute
		req := testutils.MakeReq(server, "POST", "/verification-token", "")
		res := testutils.HTTPAuthDo(t, req, user)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusGone, "Status code mismatch")

		var account database.Account
		var tokenCount int
		testutils.MustExec(t, db.Where("user_id = ?", user.ID).First(&account), "finding account")
		testutils.MustExec(t, db.Model(&database.Token{}).Count(&tokenCount), "counting token")

		assert.Equal(t, account.EmailVerified, true, "email_verified should not have been updated")
		assert.Equal(t, tokenCount, 0, "token count mismatch")
	})
}

func TestVerifyEmail(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		user := testutils.SetupUserData()
		testutils.SetupAccountData(user, "sung@dnote.io", "pass1234")
		tok := database.Token{
			UserID: user.ID,
			Type:   database.TokenTypeEmailVerification,
			Value:  "someTokenValue",
		}
		testutils.MustExec(t, db.Save(&tok), "preparing token")

		dat := `{"token": "someTokenValue"}`
		req := testutils.MakeReq(server, "PATCH", "/verify-email", dat)

		// Execute
		res := testutils.HTTPAuthDo(t, req, user)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusOK, "Status code mismatch")

		var account database.Account
		var token database.Token
		var tokenCount int
		testutils.MustExec(t, db.Where("user_id = ?", user.ID).First(&account), "finding account")
		testutils.MustExec(t, db.Where("user_id = ? AND type = ?", user.ID, database.TokenTypeEmailVerification).First(&token), "finding token")
		testutils.MustExec(t, db.Model(&database.Token{}).Count(&tokenCount), "counting token")

		assert.Equal(t, account.EmailVerified, true, "email_verified mismatch")
		assert.NotEqual(t, token.Value, "", "token value should not have been updated")
		assert.Equal(t, tokenCount, 1, "token count mismatch")
		assert.NotEqual(t, token.UsedAt, (*time.Time)(nil), "token should have been used")
	})

	t.Run("used token", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		user := testutils.SetupUserData()
		testutils.SetupAccountData(user, "sung@dnote.io", "pass1234")

		usedAt := time.Now().Add(time.Hour * -11).UTC()
		tok := database.Token{
			UserID: user.ID,
			Type:   database.TokenTypeEmailVerification,
			Value:  "someTokenValue",
			UsedAt: &usedAt,
		}
		testutils.MustExec(t, db.Save(&tok), "preparing token")

		dat := `{"token": "someTokenValue"}`
		req := testutils.MakeReq(server, "PATCH", "/verify-email", dat)

		// Execute
		res := testutils.HTTPAuthDo(t, req, user)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusBadRequest, "")

		var account database.Account
		var token database.Token
		var tokenCount int
		testutils.MustExec(t, db.Where("user_id = ?", user.ID).First(&account), "finding account")
		testutils.MustExec(t, db.Where("user_id = ? AND type = ?", user.ID, database.TokenTypeEmailVerification).First(&token), "finding token")
		testutils.MustExec(t, db.Model(&database.Token{}).Count(&tokenCount), "counting token")

		assert.Equal(t, account.EmailVerified, false, "email_verified mismatch")
		assert.NotEqual(t, token.UsedAt, nil, "token used_at mismatch")
		assert.Equal(t, tokenCount, 1, "token count mismatch")
		assert.NotEqual(t, token.UsedAt, (*time.Time)(nil), "token should have been used")
	})

	t.Run("expired token", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		user := testutils.SetupUserData()
		testutils.SetupAccountData(user, "sung@dnote.io", "pass1234")

		tok := database.Token{
			UserID: user.ID,
			Type:   database.TokenTypeEmailVerification,
			Value:  "someTokenValue",
		}
		testutils.MustExec(t, db.Save(&tok), "preparing token")
		testutils.MustExec(t, db.Model(&tok).Update("created_at", time.Now().Add(time.Minute*-31)), "Failed to prepare token created_at")

		dat := `{"token": "someTokenValue"}`
		req := testutils.MakeReq(server, "PATCH", "/verify-email", dat)

		// Execute
		res := testutils.HTTPAuthDo(t, req, user)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusGone, "")

		var account database.Account
		var token database.Token
		var tokenCount int
		testutils.MustExec(t, db.Where("user_id = ?", user.ID).First(&account), "finding account")
		testutils.MustExec(t, db.Where("user_id = ? AND type = ?", user.ID, database.TokenTypeEmailVerification).First(&token), "finding token")
		testutils.MustExec(t, db.Model(&database.Token{}).Count(&tokenCount), "counting token")

		assert.Equal(t, account.EmailVerified, false, "email_verified mismatch")
		assert.Equal(t, tokenCount, 1, "token count mismatch")
		assert.Equal(t, token.UsedAt, (*time.Time)(nil), "token should have not been used")
	})

	t.Run("already verified", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		user := testutils.SetupUserData()
		a := testutils.SetupAccountData(user, "sung@dnote.io", "oldpass1234")
		a.EmailVerified = true
		testutils.MustExec(t, db.Save(&a), "preparing account")

		tok := database.Token{
			UserID: user.ID,
			Type:   database.TokenTypeEmailVerification,
			Value:  "someTokenValue",
		}
		testutils.MustExec(t, db.Save(&tok), "preparing token")

		dat := `{"token": "someTokenValue"}`
		req := testutils.MakeReq(server, "PATCH", "/verify-email", dat)

		// Execute
		res := testutils.HTTPAuthDo(t, req, user)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusConflict, "")

		var account database.Account
		var token database.Token
		var tokenCount int
		testutils.MustExec(t, db.Where("user_id = ?", user.ID).First(&account), "finding account")
		testutils.MustExec(t, db.Where("user_id = ? AND type = ?", user.ID, database.TokenTypeEmailVerification).First(&token), "finding token")
		testutils.MustExec(t, db.Model(&database.Token{}).Count(&tokenCount), "counting token")

		assert.Equal(t, account.EmailVerified, true, "email_verified mismatch")
		assert.Equal(t, tokenCount, 1, "token count mismatch")
		assert.Equal(t, token.UsedAt, (*time.Time)(nil), "token should have not been used")
	})
}

func TestUpdateEmail(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		u := testutils.SetupUserData()
		a := testutils.SetupAccountData(u, "alice@example.com", "pass1234")
		a.EmailVerified = true
		testutils.MustExec(t, db.Save(&a), "updating email_verified")

		// Execute
		dat := `{"email": "alice-new@example.com"}`
		req := testutils.MakeReq(server, "PATCH", "/account/profile", dat)
		res := testutils.HTTPAuthDo(t, req, u)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusOK, "")

		var user database.User
		var account database.Account
		testutils.MustExec(t, db.Where("id = ?", u.ID).First(&user), "finding user")
		testutils.MustExec(t, db.Where("user_id = ?", u.ID).First(&account), "finding account")

		assert.Equal(t, account.Email.String, "alice-new@example.com", "email mismatch")
		assert.Equal(t, account.EmailVerified, false, "EmailVerified mismatch")
	})
}

func TestUpdateEmailPreferences(t *testing.T) {
	t.Run("with login", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		u := testutils.SetupUserData()
		testutils.SetupEmailPreferenceData(u, false)

		// Execute
		dat := `{"digest_weekly": true}`
		req := testutils.MakeReq(server, "PATCH", "/account/email-preference", dat)
		res := testutils.HTTPAuthDo(t, req, u)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusOK, "")

		var preference database.EmailPreference
		testutils.MustExec(t, db.Where("user_id = ?", u.ID).First(&preference), "finding account")
		assert.Equal(t, preference.DigestWeekly, true, "preference mismatch")
	})

	t.Run("with token", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		u := testutils.SetupUserData()
		testutils.SetupEmailPreferenceData(u, false)
		tok := database.Token{
			UserID: u.ID,
			Type:   database.TokenTypeEmailPreference,
			Value:  "someTokenValue",
		}
		testutils.MustExec(t, db.Save(&tok), "preparing token")

		// Execute
		dat := `{"digest_weekly": true}`
		url := fmt.Sprintf("/account/email-preference?token=%s", "someTokenValue")
		req := testutils.MakeReq(server, "PATCH", url, dat)
		res := testutils.HTTPDo(t, req)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusOK, "")

		var preference database.EmailPreference
		var preferenceCount int
		var token database.Token
		testutils.MustExec(t, db.Where("user_id = ?", u.ID).First(&preference), "finding preference")
		testutils.MustExec(t, db.Model(database.EmailPreference{}).Count(&preferenceCount), "counting preference")
		testutils.MustExec(t, db.Where("id = ?", tok.ID).First(&token), "failed to find token")

		assert.Equal(t, preferenceCount, 1, "preference count mismatch")
		assert.Equal(t, preference.DigestWeekly, true, "email mismatch")
		assert.NotEqual(t, token.UsedAt, (*time.Time)(nil), "token should have been used")
	})

	t.Run("with nonexistent token", func(t *testing.T) {
		defer testutils.ClearData()
		db := database.DBConn

		// Setup
		server := httptest.NewServer(NewRouter(&App{
			Clock: clock.NewMock(),
		}))
		defer server.Close()

		u := testutils.SetupUserData()
		testutils.SetupEmailPreferenceData(u, true)
		tok := database.Token{
			UserID: u.ID,
			Type:   database.TokenTypeEmailPreference,
			Value:  "someTokenValue",
		}
		testutils.MustExec(t, db.Save(&tok), "preparing token")

		dat := `{"digest_weekly": false}`
		url := fmt.Sprintf("/account/email-preference?token=%s", "someNonexistentToken")
		req := testutils.MakeReq(server, "PATCH", url, dat)

		// Execute
		res := testutils.HTTPDo(t, req)

		// Test
		assert.StatusCodeEquals(t, res, http.StatusUnauthorized, "")

		var preference database.EmailPreference
		testutils.MustExec(t, db.Where("user_id = ?", u.ID).First(&preference), "finding preference")
		assert.Equal(t, preference.DigestWeekly, true, "email mismatch")
	})
}
