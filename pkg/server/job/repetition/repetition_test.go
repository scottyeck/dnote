package repetition

import (
	"testing"
	"time"

	"github.com/dnote/dnote/pkg/assert"
	"github.com/dnote/dnote/pkg/clock"
	"github.com/dnote/dnote/pkg/server/database"
	"github.com/dnote/dnote/pkg/server/testutils"
)

func init() {
	testutils.InitTestDB()
}

func assertLastActive(t *testing.T, ruleUUID string, lastActive int64) {
	db := database.DBConn

	var rule database.RepetitionRule
	testutils.MustExec(t, db.Where("uuid = ?", ruleUUID).First(&rule), "finding rule1")

	assert.Equal(t, rule.LastActive, lastActive, "LastActive mismatch")
}

func TestDo(t *testing.T) {
	t.Run("processes the rule on time", func(t *testing.T) {
		defer testutils.ClearData()

		// Set up
		user := testutils.SetupUserData()
		r1 := database.RepetitionRule{
			Title:      "Rule 1",
			Frequency:  (time.Hour * 24 * 3).Milliseconds(), // three days
			Hour:       12,
			Minute:     2,
			LastActive: 0,
			UserID:     user.ID,
			BookDomain: database.BookDomainAll,
		}

		db := database.DBConn
		testutils.MustExec(t, db.Save(&r1), "preparing rule1")

		c := clock.NewMock()

		// Test
		c.SetNow(time.Date(2009, time.November, 10, 12, 1, 0, 0, time.UTC))
		Do(c)
		assertLastActive(t, r1.UUID, int64(0))

		c.SetNow(time.Date(2009, time.November, 10, 12, 2, 0, 0, time.UTC))
		Do(c)
		assertLastActive(t, r1.UUID, int64(1257854520000))

		c.SetNow(time.Date(2009, time.November, 10, 12, 3, 0, 0, time.UTC))
		Do(c)
		assertLastActive(t, r1.UUID, int64(1257854520000))

		// 1 day later
		c.SetNow(time.Date(2009, time.November, 11, 12, 2, 0, 0, time.UTC))
		Do(c)
		assertLastActive(t, r1.UUID, int64(1257854520000))
		// 2 days later
		c.SetNow(time.Date(2009, time.November, 12, 12, 2, 0, 0, time.UTC))
		Do(c)
		assertLastActive(t, r1.UUID, int64(1257854520000))
		// 3 days later - should be processed
		c.SetNow(time.Date(2009, time.November, 13, 12, 2, 0, 0, time.UTC))
		Do(c)
		assertLastActive(t, r1.UUID, int64(1258113720000))
		// 4 days later
		c.SetNow(time.Date(2009, time.November, 14, 12, 2, 0, 0, time.UTC))
		Do(c)
		assertLastActive(t, r1.UUID, int64(1258113720000))
		// 5 days later
		c.SetNow(time.Date(2009, time.November, 15, 12, 2, 0, 0, time.UTC))
		Do(c)
		assertLastActive(t, r1.UUID, int64(1258113720000))
		// 6 days later - should be processed
		c.SetNow(time.Date(2009, time.November, 16, 12, 2, 0, 0, time.UTC))
		Do(c)
		assertLastActive(t, r1.UUID, int64(1258372920000))
	})
}
