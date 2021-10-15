import React from 'react';


export class Menu extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedStory: '',
    };
  }

  setStory(slug) {
    this.setState({selectedStory: slug});
  }

  render() {
    if (this.state.selectedStory === '') {
      return (
        <ul>
          {Object.values(this.props.stories).map(story => (
            <li key={story.slug}>
              <button onClick={() => this.setStory(story.slug)}>{story.label}</button>
            </li>
          ))}
        </ul>
      );
    }

    const { 
      label,
      slug,
    } = this.props.stories[this.state.selectedStory];
    const StoryComponent = this.props.stories[this.state.selectedStory].getEntryComponent();
    console.dir(StoryComponent, { depth: null });
    return (
      <StoryComponent
        label={label}
        slug={slug}
      />
    );
  }

}

