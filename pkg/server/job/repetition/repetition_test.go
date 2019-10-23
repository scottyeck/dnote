package repetition

import (
	//	"fmt"
	"testing"
	"time"

	"github.com/dnote/dnote/pkg/assert"
	"github.com/dnote/dnote/pkg/clock"
	"github.com/dnote/dnote/pkg/server/database"
	"github.com/dnote/dnote/pkg/server/testutils"
	//	"github.com/pkg/errors"
)

func init() {
	testutils.InitTestDB()
}

func TestDo(t *testing.T) {
	t.Run("processes the rule on time", func(t *testing.T) {
		defer testutils.ClearData()

		// Set up
		r1 := database.RepetitionRule{
			Title:      "Rule 1",
			Frequency:  (time.Hour * 24).Milliseconds(),
			Hour:       12,
			Minute:     2,
			LastActive: 0,
		}

		db := database.DBConn
		testutils.MustExec(t, db.Save(&r1), "preparing rule1")

		c := clock.NewMock()

		// Test
		t1 := time.Date(2009, time.November, 10, 23, 12, 0, 0, time.UTC)
		c.SetNow(t1)
		Do(c)

		var r1Record database.RepetitionRule
		testutils.MustExec(t, db.Where("uuid = ?", r1.UUID).First(&r1Record), "finding rule1")
		assert.Equal(t, r1Record.LastActive, int64(0), "LastActive mismatch")
	})
}
