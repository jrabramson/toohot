const { compose, withState, withHandlers, lifecycle } = Recompose;

const narrativeUrl = 'https://s3.us-east-2.amazonaws.com/jrabramson/static/narrative.json';

const fadeInDelayed = (i) => ({
  animation: 'fadein 1s linear ' + (i + 1) + 's forwards'
});

const Options = ({ onClick, choices, position }) => {
  return <div>
    {choices.map((c, i) => {
      return <span
               className={'choice ' + position}
               key={i}
               onClick={() => onClick(i)}
               style={fadeInDelayed(i)}>
        {c}
      </span>;
    })}
  </div>;
}

const Container = ({ context, position, heat, selectChoice }) => {
  return (
    <div className='container'>
      <div className='distortion' style={{opacity: (heat * 0.1)}}></div>
      <div className='prompt'>
        <span className={position + ' reader heat' + heat}>
          {context().prompt}
        </span>
      </div>
      <div className='choices'>
        <Options onClick={selectChoice} choices={context().choices} position={position} />
      </div>
    </div>
  );
}

const App = compose(
  withState('heat', 'setHeat', 0),
  withState('narrative', 'setNarrative', { none: { choices: [] } }),
  withState('position', 'setPosition', 'none'),
  withHandlers({
    selectChoice: ({ setPosition, narrative, position, heat, setHeat }) => i => {
      setPosition('none');

      const choice = narrative[position].outcomes[i];
      const nextHeat = choice == 'gameover' ? 0 : heat + narrative[choice].heat;
      
      setTimeout(() => {
        setPosition(choice);
        setHeat(nextHeat);
      }, 1000)
    },
    context: ({ narrative, position }) => () => {
      return narrative[position];
    }
  }), 
  lifecycle({
    componentDidMount() {
      const { setNarrative, setPosition } = this.props;
      
      fetch(
        narrativeUrl,
        { mode: 'cors', cache: 'no-store' }
      ).then(function(response) {
        return response.json();
      }).then(function(data) {
        setNarrative(data.data);
        setPosition('title');
      });
    }
  })
)(Container);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
