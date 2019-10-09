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

func (a *App) getRepetitionRules(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(helpers.KeyUser).(database.User)
	if !ok {
		handleError(w, "No authenticated user found", nil, http.StatusInternalServerError)
		return
	}

	db := database.DBConn
	var repetitionRules []database.RepetitionRule
	if err := db.Where("user_id = ?", user.ID).Preload("Books").Find(&repetitionRules).Error; err != nil {
		handleError(w, "getting digest rules", nil, http.StatusInternalServerError)
		return
	}

	resp := presenters.PresentRepetitionRules(repetitionRules)
	respondJSON(w, resp)
}

type createRepetitionRuleParams struct {
	Title     string   `json:"title"`
	Hour      int      `json:"hour"`
	Minute    int      `json:"minute"`
	Frequency int      `json:"frequency"`
	Global    bool     `json:"global"`
	BookUUIDs []string `json:"book_uuids"`
}

func parseCreateRepetitionRuleParams(r *http.Request) (createRepetitionRuleParams, error) {
	var ret createRepetitionRuleParams

	if err := json.NewDecoder(r.Body).Decode(&ret); err != nil {
		return ret, errors.Wrap(err, "decoding json")
	}

	if ret.Frequency == 0 {
		return ret, errors.New("frequency is required")
	}
	if len(ret.BookUUIDs) == 0 {
		return ret, errors.New("book_uuids is required")
	}

	if ret.Global && len(ret.BookUUIDs) > 0 {
		return ret, errors.New("a global repetition should not specify book_uuids")
	}

	return ret, nil
}

func (a *App) createRepetitionRule(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(helpers.KeyUser).(database.User)
	if !ok {
		handleError(w, "No authenticated user found", nil, http.StatusInternalServerError)
		return
	}

	params, err := parseCreateRepetitionRuleParams(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	db := database.DBConn
	var books []database.Book
	if err := db.Where("user_id = ? AND uuid IN (?)", user.ID, params.BookUUIDs).Find(&books).Error; err != nil {
		handleError(w, "finding books", nil, http.StatusInternalServerError)
		return
	}

	record := database.RepetitionRule{
		Title:     params.Title,
		Hour:      params.Hour,
		Minute:    params.Minute,
		Frequency: params.Frequency,
		Global:    params.Global,
		Books:     books,
	}
	if err := db.Create(&record).Error; err != nil {
		handleError(w, "creating a digest rule", nil, http.StatusInternalServerError)
		return
	}

	resp := presenters.PresentRepetitionRule(record)

	w.WriteHeader(http.StatusCreated)
	respondJSON(w, resp)
}

type updateRepetitionRuleParams struct {
	Title     *string   `json:"title"`
	Enabled   *bool     `json:"enabled"`
	Hour      *int      `json:"hour"`
	Minute    *int      `json:"minute"`
	Frequency *int      `json:"frequency"`
	BookUUIDs *[]string `json:"book_uuids"`
}

func parseUpdateDigestParams(r *http.Request) (updateRepetitionRuleParams, error) {
	var ret updateRepetitionRuleParams

	if err := json.NewDecoder(r.Body).Decode(&ret); err != nil {
		return ret, errors.Wrap(err, "decoding json")
	}

	return ret, nil
}

func (a *App) updateRepetitionRule(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(helpers.KeyUser).(database.User)
	if !ok {
		handleError(w, "No authenticated user found", nil, http.StatusInternalServerError)
		return
	}

	vars := mux.Vars(r)
	repetitionRuleUUID := vars["repetitionRuleUUID"]

	params, err := parseUpdateDigestParams(r)
	if err != nil {
		http.Error(w, "parsing params", http.StatusBadRequest)
		return
	}

	db := database.DBConn
	var repetitionRule database.RepetitionRule
	if err := db.Where("user_id = ? AND uuid = ?", user.ID, repetitionRuleUUID).Preload("Books").First(&repetitionRule).Error; err != nil {
		handleError(w, "finding record", nil, http.StatusInternalServerError)
		return
	}

	if params.Title != nil {
		repetitionRule.Title = *params.Title
	}
	if params.Enabled != nil {
		repetitionRule.Enabled = *params.Enabled
	}
	if params.Hour != nil {
		repetitionRule.Hour = *params.Hour
	}
	if params.Minute != nil {
		repetitionRule.Minute = *params.Minute
	}
	if params.Frequency != nil {
		repetitionRule.Frequency = *params.Frequency
	}
	if params.BookUUIDs != nil {
		var books []database.Book
		if err := db.Where("user_id = ? AND uuid IN (?)", user.ID, params.BookUUIDs).Find(&books).Error; err != nil {
			handleError(w, "finding books", nil, http.StatusInternalServerError)
			return
		}

		repetitionRule.Books = books
	}

	if err := db.Save(&repetitionRule).Error; err != nil {
		handleError(w, "creating a digest rule", nil, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

	resp := presenters.PresentRepetitionRule(repetitionRule)
	respondJSON(w, resp)
}
