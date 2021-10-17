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
    // TODO: eventually implement ReactRouter to navigate between stories.

    if (this.state.selectedStory === '') {
      return (
	      <div className="container mx-auto">
          <h1 className="text-2xl">Gravel Visualizations</h1>
          <ul className="list-disc">
            {Object.values(this.props.stories).map(story => (
              <li key={story.slug}>
                <a
                  className="text-blue-600 underline"
                  href="#"
                  onClick={() => this.setStory(story.slug)}
                >
                  {story.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    const { 
      label,
      slug,
    } = this.props.stories[this.state.selectedStory];
    const StoryComponent = this.props.stories[this.state.selectedStory].getEntryComponent();
    return (
      <StoryComponent
        label={label}
        slug={slug}
      />
    );
  }

}

