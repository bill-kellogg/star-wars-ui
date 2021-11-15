import { useState } from 'react'
import axios from 'axios'
import moment from 'moment'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const OptionList = ({options, value, onChange}) => {
	if (!options) { return null }

	const optionList = options.map((option, index) => {
		return <option key={index} value={option.url}>{option.name}</option>
	});

	return (
		<select value={value} onChange={(e) => onChange(e.target.value) }>
			<option value="" disabled>Select a Star Wars Character</option>
			{optionList}
		</select>
	)
}

const FilmList = ({films, formatDate}) => {
	if (!films) { return null }

	const filmList = films.map((film, index) => {
		return (
			<li key={index} className="list-group-item">
				<h5><u>{film.title}</u></h5>
				
				<p>Released: {formatDate(film.release_date)}</p>
			</li>
		)	
	});

	return (
		<ul className="list-group">{filmList}</ul>
	)
}

function App() {
	
  const characters = [
    {
      "name": "luke skywalker",
      "url": "https://swapi.dev/api/people/1/"
    },
    {
      "name": "darth vader",
      "url": "https://swapi.dev/api/people/4/"
    },
    {
      "name": "obi-wan kenobi",
      "url": "https://swapi.dev/api/people/unknown/"
    }, 
    {
      "name": "R2-D2",
      "url": "https://swapi.dev/api/people/3/"
    }
  ];

  const [selectedCharacterUrl, setSelectedCharacterUrl] = useState("")
  const [selectedCharacterFilms, setSelectedCharacterFilms] = useState(null)
  const [statusMsg, setStatusMsg] = useState(null)

	function formatDate(apiDate) {
		return moment(apiDate).format('dddd, MMMM Do YYYY')
	}
  
  function reFormatAPIProtocol(filmLink) {
    return filmLink.replace(/^http:\/\//i, 'https://')
  }

	function getFilmData(filmLinksArr) {
    const reFormattedLinksArr = filmLinksArr.map((filmLink) => {
      return reFormatAPIProtocol(filmLink)
    })

    axios.all(
      reFormattedLinksArr.map((film) => {
        return axios.get(film)
      }
    ))
    .then(
      axios.spread( (...films) => {
        const filmData = films.map( (film) => {
          const {title, release_date} = film.data
          return {title, release_date}
        });
        
        setSelectedCharacterFilms(filmData)
        setStatusMsg(null)
      })
    )
    .catch( (error) => {
      console.log(error)
      setSelectedCharacterFilms(null)
      setStatusMsg("Film Data Not Found")
    });
  }

	function getCharacterData(characterLink) {
		axios.get(characterLink)
			.then(response => {
        getFilmData(response.data.films)
			})
			.catch( (error) => {
        console.log(error)
        setSelectedCharacterFilms(null)
        setStatusMsg("Character Data Not Found")
			});
	}

	function handleOptionChange(characterLink) {	
    setSelectedCharacterUrl(characterLink)
    setSelectedCharacterFilms(null)
    setStatusMsg("Loading...")
		getCharacterData(characterLink)
	}

  return (
    <div className="App main">
      <section className="jumbotron">
        <div className="container">
          <h1 className="jumbotron-heading display-4 text-center">star wars</h1>
          <div className="row text-center">
            <div class="col-md-12">
              <p className="lead">characters</p>
            </div>
            <div className="col-md-12">
              <OptionList
                options={characters}
                value={selectedCharacterUrl}
                onChange={selectedCharacterUrl => handleOptionChange(selectedCharacterUrl)}
              />
            </div>
            <div className="col-md-12">
              <p className="alert">{statusMsg}</p>
            </div>
          </div>
        </div>
      </section>
      

      <div className="container">
        <FilmList films={selectedCharacterFilms} formatDate={formatDate}/>
      </div>
    </div>
  );
}


export default App;
