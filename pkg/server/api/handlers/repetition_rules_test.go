/* Copyright (C) 2019 Monomax Software Pty Ltd
 *
 * This file is part of Dnote.
 *
 * Dnote is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Dnote is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Dnote.  If not, see <https://www.gnu.org/licenses/>.
 */

package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

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

func TestGetRepetitionRule(t *testing.T) {
	defer testutils.ClearData()
	db := database.DBConn

	// Setup
	server := httptest.NewServer(NewRouter(&App{
		Clock: clock.NewMock(),
	}))
	defer server.Close()

	user := testutils.SetupUserData()

	b1 := database.Book{
		USN:   11,
		Label: "js",
	}
	testutils.MustExec(t, db.Save(&b1), "preparing book1")

	r1 := database.RepetitionRule{
		Title:      "Rule 1",
		Frequency:  (time.Hour * 24 * 7).Milliseconds(),
		Hour:       21,
		Minute:     0,
		LastActive: 0,
		UserID:     user.ID,
		BookDomain: database.BookDomainExluding,
		Books:      []database.Book{b1},
		NoteCount:  5,
	}
	testutils.MustExec(t, db.Save(&r1), "preparing rule1")

	// Execute
	req := testutils.MakeReq(server, "GET", fmt.Sprintf("/repetition_rules/%s", r1.UUID), "")
	res := testutils.HTTPAuthDo(t, req, user)

	// Test
	assert.StatusCodeEquals(t, res, http.StatusOK, "")

	var payload presenters.RepetitionRule
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		t.Fatal(errors.Wrap(err, "decoding payload"))
	}

	var r1Record database.RepetitionRule
	testutils.MustExec(t, db.Where("uuid = ?", r1.UUID).First(&r1Record), "finding r1Record")
	var b1Record database.Book
	testutils.MustExec(t, db.Where("uuid = ?", b1.UUID).First(&b1Record), "finding b1Record")

	expected := presenters.RepetitionRule{
		UUID:       r1Record.UUID,
		Title:      r1Record.Title,
		Enabled:    r1Record.Enabled,
		Hour:       r1Record.Hour,
		Minute:     r1Record.Minute,
		Frequency:  r1Record.Frequency,
		BookDomain: r1Record.BookDomain,
		NoteCount:  r1Record.NoteCount,
		LastActive: r1Record.LastActive,
		Books: []presenters.Book{
			{
				UUID:      b1Record.UUID,
				USN:       b1Record.USN,
				Label:     b1Record.Label,
				CreatedAt: presenters.FormatTS(b1Record.CreatedAt),
				UpdatedAt: presenters.FormatTS(b1Record.UpdatedAt),
			},
		},
		CreatedAt: presenters.FormatTS(r1Record.CreatedAt),
		UpdatedAt: presenters.FormatTS(r1Record.UpdatedAt),
	}

	assert.DeepEqual(t, payload, expected, "payload mismatch")
}

func TestGetRepetitionRules(t *testing.T) {
	defer testutils.ClearData()
	db := database.DBConn

	// Setup
	server := httptest.NewServer(NewRouter(&App{
		Clock: clock.NewMock(),
	}))
	defer server.Close()

	user := testutils.SetupUserData()

	b1 := database.Book{
		USN:   11,
		Label: "js",
	}
	testutils.MustExec(t, db.Save(&b1), "preparing book1")

	r1 := database.RepetitionRule{
		Title:      "Rule 1",
		Frequency:  (time.Hour * 24 * 7).Milliseconds(),
		Hour:       21,
		Minute:     0,
		LastActive: 0,
		UserID:     user.ID,
		BookDomain: database.BookDomainExluding,
		Books:      []database.Book{b1},
		NoteCount:  5,
	}
	testutils.MustExec(t, db.Save(&r1), "preparing rule1")

	r2 := database.RepetitionRule{
		Title:      "Rule 2",
		Frequency:  (time.Hour * 24 * 7 * 2).Milliseconds(),
		Hour:       2,
		Minute:     0,
		LastActive: 0,
		UserID:     user.ID,
		BookDomain: database.BookDomainExluding,
		Books:      []database.Book{},
		NoteCount:  5,
	}
	testutils.MustExec(t, db.Save(&r2), "preparing rule2")

	// Execute
	req := testutils.MakeReq(server, "GET", "/repetition_rules", "")
	res := testutils.HTTPAuthDo(t, req, user)

	// Test
	assert.StatusCodeEquals(t, res, http.StatusOK, "")

	var payload []presenters.RepetitionRule
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		t.Fatal(errors.Wrap(err, "decoding payload"))
	}

	var r1Record, r2Record database.RepetitionRule
	testutils.MustExec(t, db.Where("uuid = ?", r1.UUID).First(&r1Record), "finding r1Record")
	testutils.MustExec(t, db.Where("uuid = ?", r2.UUID).First(&r2Record), "finding r2Record")
	var b1Record database.Book
	testutils.MustExec(t, db.Where("uuid = ?", b1.UUID).First(&b1Record), "finding b1Record")

	expected := []presenters.RepetitionRule{
		{
			UUID:       r1Record.UUID,
			Title:      r1Record.Title,
			Enabled:    r1Record.Enabled,
			Hour:       r1Record.Hour,
			Minute:     r1Record.Minute,
			Frequency:  r1Record.Frequency,
			BookDomain: r1Record.BookDomain,
			NoteCount:  r1Record.NoteCount,
			LastActive: r1Record.LastActive,
			Books: []presenters.Book{
				{
					UUID:      b1Record.UUID,
					USN:       b1Record.USN,
					Label:     b1Record.Label,
					CreatedAt: presenters.FormatTS(b1Record.CreatedAt),
					UpdatedAt: presenters.FormatTS(b1Record.UpdatedAt),
				},
			},
			CreatedAt: presenters.FormatTS(r1Record.CreatedAt),
			UpdatedAt: presenters.FormatTS(r1Record.UpdatedAt),
		},
		{
			UUID:       r2Record.UUID,
			Title:      r2Record.Title,
			Enabled:    r2Record.Enabled,
			Hour:       r2Record.Hour,
			Minute:     r2Record.Minute,
			Frequency:  r2Record.Frequency,
			BookDomain: r2Record.BookDomain,
			NoteCount:  r2Record.NoteCount,
			LastActive: r2Record.LastActive,
			Books:      []presenters.Book{},
			CreatedAt:  presenters.FormatTS(r2Record.CreatedAt),
			UpdatedAt:  presenters.FormatTS(r2Record.UpdatedAt),
		},
	}

	assert.DeepEqual(t, payload, expected, "payload mismatch")
}
