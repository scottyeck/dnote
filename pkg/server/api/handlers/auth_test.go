package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/dnote/dnote/pkg/assert"
	"github.com/dnote/dnote/pkg/clock"
	"github.com/dnote/dnote/pkg/server/database"
	"github.com/dnote/dnote/pkg/server/testutils"
)

func TestCreateResetToken(t *testing.T) {
	defer testutils.ClearData()
	db := database.DBConn

	// Setup
	server := httptest.NewServer(NewRouter(&App{
		Clock: clock.NewMock(),
	}))
	defer server.Close()

	u := testutils.SetupUserData()
	testutils.SetupAccountData(u, "alice@example.com", "somepassword")

	dat := `{"email": "alice@example.com"}`
	req := testutils.MakeReq(server, "POST", "/reset-token", dat)

	// Execute
	res := testutils.HTTPDo(t, req)

	// Test
	assert.StatusCodeEquals(t, res, http.StatusOK, "Status code mismtach")

	var tokenCount int
	testutils.MustExec(t, db.Model(&database.Token{}).Count(&tokenCount), "counting tokens")

	var resetToken database.Token
	testutils.MustExec(t, db.Where("user_id = ? AND type = ?", u.ID, database.TokenTypeResetPassword).First(&resetToken), "finding reset token")

	assert.Equal(t, tokenCount, 1, "reset_token count mismatch")
	assert.NotEqual(t, resetToken.Value, nil, "reset_token value mismatch")
	if resetToken.UsedAt != nil {
		t.Errorf("used_at should be nil but got: %+v", resetToken.UsedAt)
	}
}
