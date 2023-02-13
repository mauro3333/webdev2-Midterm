function switchBack(id) {
	document.getElementById(id).style.transform = "rotateY(180deg)";
}

function switchFront(id) {
	document.getElementById(id).style.transform = "rotateY(0deg)";
}

let finalMovieArray = [];
let finalTvArray = [];
let genreTvNameGlobal = {};
let genreMovieNameGlobal = {};
let genres = [];


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const getTrendingData = async () => {
	const tvData = await fetch("https://api.themoviedb.org/3/trending/tv/week?api_key=62b02abd5a65773a68f6537cbbd0b18a");
	const genreTvData =  await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=62b02abd5a65773a68f6537cbbd0b18a&language=en-US`);
	const movieData = await fetch("https://api.themoviedb.org/3/trending/movie/week?api_key=62b02abd5a65773a68f6537cbbd0b18a");
	const genreMovieData =  await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=62b02abd5a65773a68f6537cbbd0b18a&language=en-US`);

	const finalMovieData = await movieData.json(); // Parse the data to JSON
	const finalTvData = await tvData.json();
	const finalGenreTvData = await genreTvData.json();
	const finalGenreMovieData = await genreMovieData.json();

	finalMovieArray = parseList(finalMovieData.results, finalGenreMovieData.genres, "movie");
	generateUI(finalMovieArray);

	finalTvArray = parseList(finalTvData.results, finalGenreTvData.genres, "tv");
	generateUI(finalTvArray);
};
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const parseList = (array, genreArray, type) => {

	if ((type == "tv")) {
		array.forEach((item) => {
			item["title"] = item["name"];
			item["release_date"] = item["first_air_date"];

			delete item["name"];
			delete item["first_air_date"];
		});
		genreTvNameGlobal = JSON.parse(JSON.stringify(genreArray));
	}
	else if(type == "movie"){
		genreMovieNameGlobal = JSON.parse(JSON.stringify(genreArray));
	}

	return array.map(
		({
			id,
			title,
			media_type,
			poster_path,
			release_date,
			overview,
			backdrop_path,
            genre_ids,
		}) => {
			genre_ids.forEach((element, index) => {
				genreArray.find((genre) => {
					if (genre.id == element) {
						genre_ids[index] = genre.name;
					}
				});
			});

			return {
				movieId: id,
				movieTitle: title || "No Name Found",
				mediaType: media_type || type,
				posterPath:	poster_path, 
				backdropPath: backdrop_path,
				releaseDate: release_date || "No Data",
				overviewText: overview || "No Overview",
                genreIds: genre_ids,
				visible: true,
			};
		}
	);
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const generateUI = (array) => {
	if (array[0].mediaType === "movie") {
		let containerMovie = document.getElementById("moviesContainer");
		containerMovie.innerHTML = "";
	} else if (array[0].mediaType === "tv") {
		let containerTv = document.getElementById("tvContainer");
		containerTv.innerHTML = "";
	}

	let tempoGenreArray = [...genres];

	array.forEach(
		({
			movieId,
			movieTitle,
			releaseDate,
			posterPath,
			backdropPath,
			mediaType,
			overviewText,
			genreIds,
			visible,
		}) => {
			if (visible) {
				let posterImage = document.createElement("img");
				let backImage = document.createElement("img");
				let titleH2 = document.createElement("h2");
				let releaseDateP = document.createElement("p");
				let overviewP = document.createElement("p");
				let overviewDiv = document.createElement("div");
				let genreDiv = document.createElement("div");
				let frontDiv = document.createElement("div");
				let genreName = document.createElement("h3");

				if (mediaType === "movie") {
					var container = document.getElementById("moviesContainer");
				} else if (mediaType === "tv") {
					var container = document.getElementById("tvContainer");
				}

				genreName.textContent = "<== Genres ==>";
				genreDiv.appendChild(genreName);

				genreDiv.classList.add("genre-div");
				frontDiv.classList.add("front-div");

				genreIds.forEach((element) => {
					let genre = document.createElement("p");
					genre.textContent = element;
					genreDiv.appendChild(genre);
					tempoGenreArray.push(element);
					genres = [...new Set(tempoGenreArray)];
					genres.sort();
				});

				let flipCard = document.createElement("div");
				flipCard.classList.add("flip-card");

				let flipCardInner = document.createElement("div");
				flipCardInner.classList.add("flip-card-inner");
				flipCardInner.setAttribute("id", `${movieId}`);

				let flipCardFront = document.createElement("div");
				flipCardFront.classList.add("flip-card-front");
				flipCardFront.setAttribute("onclick", `switchBack(${movieId})`);

				let flipCardBack = document.createElement("div");
				flipCardBack.classList.add("flip-card-back");
				flipCardBack.setAttribute("onclick", `switchFront(${movieId})`);

				if (posterPath != null) {
					posterImage.src =
						"https://www.themoviedb.org/t/p/w300_and_h450_bestv2" + posterPath;
				} else {
					posterImage.src = "https://via.placeholder.com/300x450";
				}

				if (backdropPath != null) {
					backImage.src =
						"https://www.themoviedb.org/t/p/w300_and_h450_bestv2" + backdropPath;
				} else {
					backImage.src = "https://via.placeholder.com/300x450";
				}

				titleH2.textContent = `${movieTitle}`;
				releaseDateP.textContent = `Release Date: ${releaseDate}`;
				overviewP.textContent = `Overview: ${overviewText}`;

				overviewDiv.append(overviewP, releaseDateP);
				frontDiv.append(titleH2, genreDiv);
				flipCardFront.append(posterImage, frontDiv);
				flipCardBack.append(overviewDiv, backImage);
				flipCardInner.append(flipCardFront, flipCardBack);
				flipCard.appendChild(flipCardInner);

				container.appendChild(flipCard);
			}
		}
	);
};


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const getSearchData = async (type, search) => {
	const resultData = await fetch(`https://api.themoviedb.org/3/search/${type}?api_key=62b02abd5a65773a68f6537cbbd0b18a&language=en-US&query=${search}&page=1&include_adult=false`);
	const finalResultData = await resultData.json();

	if(type == "tv"){
		var modifiedArray = parseList(finalResultData.results, genreTvNameGlobal, type);
	}else if(type == "movie"){
		var modifiedArray = parseList(finalResultData.results, genreMovieNameGlobal, type);
	}
	generateUI(modifiedArray);

	
};
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const getFullSearchData = async (search) => {
	const resultData = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=62b02abd5a65773a68f6537cbbd0b18a&language=en-US&query=${search}&page=1&include_adult=false`);
	const finalResultData = await resultData.json();
	console.log(finalResultData, " Full RESULT", search);
};
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const getGenreData = async (type) => {
	const resultData =  await fetch(`https://api.themoviedb.org/3/genre/${type}/list?api_key=62b02abd5a65773a68f6537cbbd0b18a&language=en-US`);
	const finalResultData = await resultData.json();

	if (type === "movie") {
		const finalGenreMovie = await resultData.json();
		console.log(finalGenreMovie, " GENRE", type);
	} else if (type === "tv") {
		const finalGenreTv = await resultData.json();
		console.log(finalGenreTv, " GENRE", type);
	}
};
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function searchTv() {
	let searchKeyword = document.getElementById('searchTv-input');
	getSearchData("tv", searchKeyword.value);
	updateVisible("movie", false);
	generateUI(finalMovieArray);
}

function searchMovie() {
	let searchKeyword = document.getElementById('searchMovie-input');
	getSearchData("movie", searchKeyword.value);
	updateVisible("tv", false);
	generateUI(finalTvArray);
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function updateFilterList() {
	let containerFilter = document.getElementById("filter-container");	
	containerFilter.innerHTML = "";

	let filterDiv = document.createElement("div");

	let showAllButton = document.createElement("button");
	showAllButton.textContent = "Show All";
	showAllButton.setAttribute("onclick", "filterElements(\"all\")");
	showAllButton.setAttribute("id", "all");
	showAllButton.classList.add("filter-button");

	let moviesButton = document.createElement("button");
	moviesButton.textContent = "Movies";
	moviesButton.setAttribute("onclick", "filterElements(\"movies\")");
	moviesButton.setAttribute("id", "movies");
	moviesButton.classList.add("filter-button");

	let tvButton = document.createElement("button");
	tvButton.textContent = "TV Shows";
	tvButton.setAttribute("onclick", "filterElements(\"tv\")");
	tvButton.setAttribute("id", "tv");
	tvButton.classList.add("filter-button");

	filterDiv.append(showAllButton, moviesButton, tvButton);

	genres.forEach((element) => {
		let filterButton = document.createElement("button");
		filterButton.textContent = element;
		filterButton.setAttribute("onclick", `filterElements("${element}")`);
		filterButton.setAttribute("id", `${element}`);
		filterButton.classList.add("filter-button");
		filterDiv.appendChild(filterButton);
	});
	containerFilter.appendChild(filterDiv);
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function filterElements(genre) {
	updateFilterList();
	let activeButton = document.getElementById(genre);
	
	activeButton.classList.add("filterActive-button");


	switch (genre) {
		case "all":
			updateVisible("movie", true);
			updateVisible("tv", true);
			break;

		case "movies":
			updateVisible("movie", true);
			updateVisible("tv", false);
			break;

		case "tv":
			updateVisible("movie", false);
			updateVisible("tv", true);
			break;

		default:
			updateVisible("movie", false);
			updateVisible("tv", false);

			finalMovieArray.forEach((element, index) => {
				element.genreIds.find((genres) => {
					if (genres == genre) {
						finalMovieArray[index].visible = true;
					}
				});
			});

			finalTvArray.forEach((element, index) => {
				element.genreIds.find((genres) => {
					if (genres == genre) {
						finalTvArray[index].visible = true;
					}
				});
			});
	}

	generateUI(finalMovieArray);
	generateUI(finalTvArray);
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function updateVisible(type, state) {
	if (type === "movie") {
		finalMovieArray.forEach((element) => {
			element.visible = state;
		});
	} else if (type === "tv") {
		finalTvArray.forEach((element) => {
			element.visible = state;
		});
	}
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function stickyBar() {
	let filterDiv = document.getElementById("filter-div");
	let title = document.getElementById("title");
	let sticky = filterDiv.offsetTop;
	
	if (window.pageYOffset >= sticky) {
		filterDiv.classList.add("sticky");
		title.classList.add("sticky-top");

	} else {
		filterDiv.classList.remove("sticky");
		title.classList.remove("sticky-top");

	}
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++




getTrendingData();
setTimeout(updateFilterList, 1000);


window.addEventListener("scroll", stickyBar);






