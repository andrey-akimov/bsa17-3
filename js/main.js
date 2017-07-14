window.onload = function() {
	
	let request = new XMLHttpRequest();
	request.open('GET', 'https://api.myjson.com/bins/152f9j', true);
	request.send();
	request.onreadystatechange = getData;

	let news;
	let sorted;
	let counter = 20;
	let posts = document.getElementById('posts');
	let inputs = document.querySelectorAll('input[type="checkbox"]');
	document.getElementById('search').addEventListener('input', onSearch);
	let tags = [];

	inputs.forEach(function(item){
		tags.push(item.id);
		item.addEventListener('change', function(){
			localStorage[this.id] = [this.checked];
			tagsSort();
			renderArticles(sorted, 0, 10);
			counter = 20;
			window.scrollTo(0, 0);
		});
		if (localStorage[item.id] == 'true') {
			item.checked = true;
		}
	});
	
	function getData(){
		if (this.readyState == 4) {
			news = JSON.parse(request.responseText).data;
		
			// Sorting posts by date
			news.sort(function(a, b){
				return new Date(b['createdAt']) - new Date(a['createdAt']);
			});
			tagsSort();
			renderArticles(sorted, 0, 10);
		}

		if (this.status != 200) {
			console.log(`Error: ${(this.status ? this.statusText : 'request fail')}`);
		}
	}

	function tagsSort(){
		let newsCopy = news.slice(0);
		let tagNews = [];
		
		for (let t = newsCopy.length - 1; t >= 0; t--) {
			for (let l = 0; l < tags.length; l++) {
				if (localStorage[tags[l]] == 'true' && (newsCopy[t]['tags'].includes(tags[l]))) {
					tagNews.unshift(newsCopy[t]);
					newsCopy.splice(t, 1);
					if (t == 0) {
						break;
					}
					t--;
				}
			}
		}
		
		sorted = tagNews.concat(newsCopy);
	}

	// Creating elements
	function renderArticles(data, from, to){
		posts.innerHTML = '';
		dataCut = data.slice(from, to);

		for (let i = 0; i < dataCut.length; i++) {

			let article = document.createElement('div');
			article.className = 'article';
			let close = document.createElement('i');
			close.innerHTML = 'X';
			let h3 = document.createElement('h3');
			h3.className = 'article__title';
			let wrap = document.createElement('div');
			wrap.className = 'article__wrap';
			let par = document.createElement('p');
			par.className = 'article__text';
			let img = document.createElement('img');
			img.className = 'article__img';
			let footer = document.createElement('div');
			footer.className = 'article__footer';
			let date = document.createElement('div');
			date.className = 'article__date';
			let tags = document.createElement('div');
			tags.className = 'article__tags';

			posts.appendChild(article);
			article.appendChild(close);
			h3.innerHTML = dataCut[i]['title'];
			article.appendChild(h3);
			par.innerHTML = dataCut[i]['description'];
			article.appendChild(wrap);
			img.setAttribute('src', dataCut[i]['image']);
			wrap.appendChild(img);
			wrap.appendChild(par);
			article.appendChild(footer);
			tags.innerHTML = dataCut[i]['tags'];
			footer.appendChild(tags);
			date.innerHTML = getFullDate(dataCut[i]['createdAt']);
			footer.appendChild(date);

			document.getElementsByTagName('i')[i].addEventListener('click', function(){
				this.closest('div').remove();
			});
		}

	}

	function getFullDate(date) {
		let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let createdAt = new Date(date);
		let day = createdAt.getDate();
		let month = createdAt.getMonth();
		let year = createdAt.getFullYear();

		return `${months[month]} ${day}, ${year}`;
	}

	function onSearch(e) {
		let searchStr = e.target.value.toLowerCase();
		let newSorted = sorted.filter(function(item){
			return item['title'].toLowerCase().includes(searchStr);
		});
		counter = 10;
		renderArticles(newSorted, 0, counter);
	}

	window.onscroll = function(){
		if (((window.innerHeight + window.scrollY) >= document.body.scrollHeight) && counter <= sorted.length) {
			renderArticles(sorted, 0, counter);
			counter += 10;
		}
	};

}