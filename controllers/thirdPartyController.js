const axios = require('axios');
require('dotenv').config();

const movieData = {
	imageUrl: "https://image.tmdb.org/t/p/w300",
	apiUrl: "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1&api_key=",
	apiKey: process.env.APIKEY
};

const movies = (req, res) => {
	axios.get(movieData.apiUrl + movieData.apiKey)
	.then(data => {
		const listings = [];
		for(listing of data.data.results) {
			const entry = {
				title: listing.original_title,
				description: listing.overview,
				image: movieData.imageUrl + listing.poster_path
			};
			listings.push(entry);
		}
		req.flash('info', listings);

		res.render('movies', { title: req.flash('title'), info: req.flash('info') });
	})
	.catch(err => {
		return res.status(500).json({error: err});
	});
}

const randomApi = "https://randomuser.me/api/?results=100&inc=name,picture";

const random = (req, res) => {
	axios.get(randomApi)
	.then(data => {
		const listings = [];
		for(listing of data.data.results) {
			const entry = {
				picture: listing.picture.large,
				name: listing.name.first + ' ' + listing.name.last
			};
			listings.push(entry);
		}
		req.flash('info', listings);

		res.render('random', { title: req.flash('title'), info: req.flash('info') });
	})
	.catch(err => {
		return res.status(500).json({error: err});
	});
}

module.exports = {
	movies: movies,
	random: random
};