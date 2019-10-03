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
	"net/http"

	"github.com/dnote/dnote/pkg/server/api/helpers"
	"github.com/dnote/dnote/pkg/server/api/presenters"
	"github.com/dnote/dnote/pkg/server/database"
	"github.com/gorilla/mux"
	"github.com/pkg/errors"
)

func (a *App) getDigestRules(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(helpers.KeyUser).(database.User)
	if !ok {
		handleError(w, "No authenticated user found", nil, http.StatusInternalServerError)
		return
	}

	db := database.DBConn
	var digestRules []database.DigestRule
	if err := db.Where("user_id = ?", user.ID).Preload("Books").Find(&digestRules).Error; err != nil {
		handleError(w, "getting digest rules", nil, http.StatusInternalServerError)
		return
	}

	resp := presenters.PresentDigestRules(digestRules)
	respondJSON(w, resp)
}

type createDigestRuleParams struct {
	Title     string   `json:"title"`
	Hour      int      `json:"hour"`
	Minute    int      `json:"minute"`
	Frequency int      `json:"frequency"`
	BookUUIDs []string `json:"book_uuids"`
}

func parseCreateDigestRuleParams(r *http.Request) (createDigestRuleParams, error) {
	var ret createDigestRuleParams

	if err := json.NewDecoder(r.Body).Decode(&ret); err != nil {
		return ret, errors.Wrap(err, "decoding json")
	}

	if ret.Frequency == 0 {
		return ret, errors.New("frequency is required")
	}
	if len(ret.BookUUIDs) == 0 {
		return ret, errors.New("book_uuids is required")
	}

	return ret, nil
}

func (a *App) createDigestRule(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(helpers.KeyUser).(database.User)
	if !ok {
		handleError(w, "No authenticated user found", nil, http.StatusInternalServerError)
		return
	}

	params, err := parseCreateDigestRuleParams(r)
	if err != nil {
		http.Error(w, "parsing params", http.StatusBadRequest)
		return
	}

	db := database.DBConn
	var books []database.Book
	if err := db.Where("user_id = ? AND uuid IN (?)", user.ID, params.BookUUIDs).Find(&books).Error; err != nil {
		handleError(w, "finding books", nil, http.StatusInternalServerError)
		return
	}

	record := database.DigestRule{
		Title:     params.Title,
		Hour:      params.Hour,
		Minute:    params.Minute,
		Frequency: params.Frequency,
		Books:     books,
	}
	if err := db.Create(&record).Error; err != nil {
		handleError(w, "creating a digest rule", nil, http.StatusInternalServerError)
		return
	}

	resp := presenters.PresentDigestRule(record)

	w.WriteHeader(http.StatusCreated)
	respondJSON(w, resp)
}

type updateDigestRuleParams struct {
	Title     *string   `json:"title"`
	Enabled   *bool     `json:"enabled"`
	Hour      *int      `json:"hour"`
	Minute    *int      `json:"minute"`
	Frequency *int      `json:"frequency"`
	BookUUIDs *[]string `json:"book_uuids"`
}

func parseUpdateDigestParams(r *http.Request) (updateDigestRuleParams, error) {
	var ret updateDigestRuleParams

	if err := json.NewDecoder(r.Body).Decode(&ret); err != nil {
		return ret, errors.Wrap(err, "decoding json")
	}

	return ret, nil
}

func (a *App) updateDigestRule(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(helpers.KeyUser).(database.User)
	if !ok {
		handleError(w, "No authenticated user found", nil, http.StatusInternalServerError)
		return
	}

	vars := mux.Vars(r)
	digestRuleUUID := vars["digestRuleUUID"]

	params, err := parseUpdateDigestParams(r)
	if err != nil {
		http.Error(w, "parsing params", http.StatusBadRequest)
		return
	}

	db := database.DBConn
	var digestRule database.DigestRule
	if err := db.Where("user_id = ? AND uuid = ?", user.ID, digestRuleUUID).Preload("Books").First(&digestRule).Error; err != nil {
		handleError(w, "finding record", nil, http.StatusInternalServerError)
		return
	}

	if params.Title != nil {
		digestRule.Title = *params.Title
	}
	if params.Enabled != nil {
		digestRule.Enabled = *params.Enabled
	}
	if params.Hour != nil {
		digestRule.Hour = *params.Hour
	}
	if params.Minute != nil {
		digestRule.Minute = *params.Minute
	}
	if params.Frequency != nil {
		digestRule.Frequency = *params.Frequency
	}
	if params.BookUUIDs != nil {
		var books []database.Book
		if err := db.Where("user_id = ? AND uuid IN (?)", user.ID, params.BookUUIDs).Find(&books).Error; err != nil {
			handleError(w, "finding books", nil, http.StatusInternalServerError)
			return
		}

		digestRule.Books = books
	}

	if err := db.Save(&digestRule).Error; err != nil {
		handleError(w, "creating a digest rule", nil, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

	resp := presenters.PresentDigestRule(digestRule)
	respondJSON(w, resp)
}
