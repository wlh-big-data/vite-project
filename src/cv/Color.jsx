import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from  './color.module.less';

export default function ColorItem(props) {
  return (
    <div
      className={classNames(styles.container, props.checked && styles.checked)}
      onClick={() => {
        props.onCheck(!props.checked);
      }}
    >
      <div style={{ background: `rgb(${props.color})` }} className={styles.color}></div>
      <span>
        第
        {props.index + 1}
        层
      </span>
    </div>
  );
}

ColorItem.propTypes = {
  checked: PropTypes.bool,
  color: PropTypes.string,
  index: PropTypes.number,
  onCheck: PropTypes.func,
};

ColorItem.defaultProps = {
  checked: false,
  color: '#000000',
  index: 0,
  onCheck: () => {},
};
