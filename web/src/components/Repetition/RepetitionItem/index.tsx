import React, { useState } from 'react';
import classnames from 'classnames';

import { RepetitionRuleData } from 'jslib/operations/types';
import { secondsToDuration, secondsToHTMLTimeDuration } from 'web/helpers/time';
import Actions from './Actions';
import styles from './RepetitionItem.scss';

interface Props {
  item: RepetitionRuleData;
}

const RepetitionItem: React.SFC<Props> = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      className={styles.wrapper}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <div className={styles['col-meta']}>
        <h2 className={styles.title}>{item.title}</h2>

        <div className={styles.meta}>
          <span className={styles.frequency}>
            Every{' '}
            <time dateTime={secondsToHTMLTimeDuration(item.frequency)}>
              {secondsToDuration(item.frequency)}
            </time>
          </span>
          <span className={styles.sep}>&middot;</span>
          <span className={styles.delivery}>email</span>
        </div>
      </div>

      <div className={styles['col-content']}>content</div>

      <div>
        <Actions isActive={isHovered} />
      </div>
    </li>
  );
};

export default RepetitionItem;
