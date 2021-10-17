import React from 'react';


export class TeamButton extends React.Component {

  constructor(props) {
    super(props);
  }


  render() {
    if (this.props.isActive) {
      return (
        <button
          onClick={this.props.clickHandler}
        >
          {this.props.slug}
        </button>
      );
    }
    return (<span>{this.props.slug}</span>);
  }

}
