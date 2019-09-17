package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	"github.com/dnote/dnote/pkg/assert"
	"github.com/dnote/dnote/pkg/clock"
	"github.com/dnote/dnote/pkg/server/api/presenters"
	"github.com/dnote/dnote/pkg/server/database"
	"github.com/dnote/dnote/pkg/server/testutils"
	"github.com/pkg/errors"
)

func init() {
	testutils.InitTestDB()
}

func TestCreateBookV2(t *testing.T) {
	defer testutils.ClearData()
	db := database.DBConn

	// Setup
	server := httptest.NewServer(NewRouter(&App{
		Clock: clock.NewMock(),
	}))
	defer server.Close()

	user := testutils.SetupUserData()
	testutils.MustExec(t, db.Model(&user).Update("max_usn", 101), "preparing user max_usn")

	req := testutils.MakeReq(server, "POST", "/v3/books", `{"name": "js"}`)
	req.Header.Set("Version", "0.1.1")
	req.Header.Set("Origin", "chrome-extension://iaolnfnipkoinabdbbakcmkkdignedce")

	// Execute
	res := testutils.HTTPAuthDo(t, req, user)

	// Test
	assert.StatusCodeEquals(t, res, http.StatusOK, "")

	var bookRecord database.Book
	var userRecord database.User
	var bookCount, noteCount int
	testutils.MustExec(t, db.Model(&database.Book{}).Count(&bookCount), "counting books")
	testutils.MustExec(t, db.Model(&database.Note{}).Count(&noteCount), "counting notes")
	testutils.MustExec(t, db.First(&bookRecord), "finding book")
	testutils.MustExec(t, db.Where("id = ?", user.ID).First(&userRecord), "finding user record")

	maxUSN := 102

	assert.Equalf(t, bookCount, 1, "book count mismatch")
	assert.Equalf(t, noteCount, 0, "note count mismatch")

	assert.NotEqual(t, bookRecord.UUID, "", "book uuid should have been generated")
	assert.Equal(t, bookRecord.Label, "js", "book name mismatch")
	assert.Equal(t, bookRecord.UserID, user.ID, "book user_id mismatch")
	assert.Equal(t, bookRecord.USN, maxUSN, "book user_id mismatch")
	assert.Equal(t, userRecord.MaxUSN, maxUSN, "user max_usn mismatch")

	var got CreateBookResp
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatal(errors.Wrap(err, "decoding got"))
	}
	expected := CreateBookResp{
		Book: presenters.Book{
			UUID:      bookRecord.UUID,
			USN:       bookRecord.USN,
			CreatedAt: bookRecord.CreatedAt,
			UpdatedAt: bookRecord.UpdatedAt,
			Label:     "js",
		},
	}

	if ok := reflect.DeepEqual(got, expected); !ok {
		t.Errorf("Payload does not match.\nActual:   %+v\nExpected: %+v", got, expected)
	}
}

func TestCreateBookDuplicate(t *testing.T) {
	defer testutils.ClearData()
	db := database.DBConn

	// Setup
	server := httptest.NewServer(NewRouter(&App{
		Clock: clock.NewMock(),
	}))
	defer server.Close()

	user := testutils.SetupUserData()
	testutils.MustExec(t, db.Model(&user).Update("max_usn", 101), "preparing user max_usn")

	b1 := database.Book{
		UserID: user.ID,
		Label:  "js",
		USN:    58,
	}
	testutils.MustExec(t, db.Save(&b1), "preparing book data")

	// Execute
	req := testutils.MakeReq(server, "POST", "/v3/books", `{"name": "js"}`)
	res := testutils.HTTPAuthDo(t, req, user)

	// Test
	assert.StatusCodeEquals(t, res, http.StatusConflict, "")

	var bookRecord database.Book
	var bookCount, noteCount int
	var userRecord database.User
	testutils.MustExec(t, db.Model(&database.Book{}).Count(&bookCount), "counting books")
	testutils.MustExec(t, db.Model(&database.Note{}).Count(&noteCount), "counting notes")
	testutils.MustExec(t, db.First(&bookRecord), "finding book")
	testutils.MustExec(t, db.Where("id = ?", user.ID).First(&userRecord), "finding user record")

	assert.Equalf(t, bookCount, 1, "book count mismatch")
	assert.Equalf(t, noteCount, 0, "note count mismatch")

	assert.Equal(t, bookRecord.Label, "js", "book name mismatch")
	assert.Equal(t, bookRecord.UserID, user.ID, "book user_id mismatch")
	assert.Equal(t, bookRecord.USN, b1.USN, "book usn mismatch")
	assert.Equal(t, userRecord.MaxUSN, 101, "user max_usn mismatch")
}
