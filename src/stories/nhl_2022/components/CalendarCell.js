import React from 'react';

import { TeamButton } from './TeamButton';


export class CalendarCell extends React.Component {

  getDomClasses() {
    switch (this.props.cellType) {
      case 'completed':
        return [
          'completed',
        ];
      case 'speculative':
        return [
          'speculative',
        ];
      case 'lookahead':
        return [
          'lookahead',
        ];
    }
    return [];
  }


  render() {
    const buttons = this.props.slugs.map((s, idx) => {
      const fnTeamButtonClick = () => {
        this.props.clickHandler(s, this.props.strDate);
      };
      return (
        <TeamButton
          active={this.props.cellType === 'lookahead'}
          clickHandler={fnTeamButtonClick}
          key={`${this.props.strDate}-${s}`}
          slug={s}
        />
      );
    });
    return (
      <td
        className={this.getDomClasses()}
      >
        {buttons}
      </td>
    );
  }

}

