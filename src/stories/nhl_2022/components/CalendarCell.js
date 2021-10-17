import React from 'react';

import { TeamButton } from './TeamButton';


export class CalendarCell extends React.Component {

  getDomClasses() {
    const defaultClasses = [
      'pr-4',
    ];

    let customClasses = [];

    switch (this.props.cellType) {
      case 'completed':
        customClasses = [
          'completed',
        ];
      case 'speculative':
        customClasses = [
          'speculative',
        ];
      case 'lookahead':
        customClasses = [
          'lookahead',
        ];
    }
    return defaultClasses.concat(customClasses);
  }


  render() {
    const buttons = this.props.slugs.map((s, idx) => {
      const fnTeamButtonClick = () => {
        this.props.clickHandler(s, this.props.strDate);
      };
      const isButtonActive = (
        this.props.generation === 0
        && this.props.cellType === 'lookahead'
      );
      return (
        <TeamButton
          isActive={isButtonActive}
          clickHandler={fnTeamButtonClick}
          key={`${this.props.strDate}-${s}`}
          slug={s}
        />
      );
    });
    return (
      <td
        className={this.getDomClasses().join(' ')}
      >
        {buttons}
      </td>
    );
  }

}

