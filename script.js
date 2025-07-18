let currentSong = new Audio();
let songs
let play = document.querySelector("#play");
let songName = document.querySelector(".songName");
let SongTime = document.querySelector(".duration");
let currFolder;

function secondToMinutesSeconds(second) {
    if (isNaN(second) || second < 0) {
        return "00:00";
    }

    const minutes = Math.floor(second / 60);
    const remaingSecond = Math.floor(second % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remaingSecond).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}`);

    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}`)[1]);
        }
    }
    //show all songa in Play list
    let songsUl = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songsUl.innerHTML = ""
    for (const song of songs) {
        songsUl.innerHTML =
            songsUl.innerHTML +
            `<li>
            <img class="invert" src="./img/music.svg" alt="">
                  <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                     
                  </div>
                  <div class="playnow">
                  <div>Play now</div>
                  <img class="invert" src="./img/play.svg" alt="">
                  </div>
                </li>
                `;

        // //Attach an add event Listener

        Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((e) => {
            e.addEventListener("click", () => {
                const trackName = e.querySelector(".info").firstElementChild.innerHTML;
                playMusic(trackName);
                songName.innerHTML = trackName;
                play.src = "./img/pause.svg";
            });
        });
    }

      // event for next song

    let next = document.querySelector("#next")
    next.addEventListener("click", () => {
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            currentSong.pause()
            let nextSong = songs[index + 1]
            playMusic(nextSong)
            songName.innerHTML = nextSong.replaceAll("%20", " ").replaceAll(".mp3", "")
            play.src = "./img/pause.svg";
        }
    })


    // event for previuos song
    let previous = document.querySelector("#previous")
    previous.addEventListener("click", () => {
        console.log("previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) > 0) {
            let nextSong = songs[index - 1]
            playMusic(nextSong)
            songName.innerHTML = nextSong.replaceAll("%20", " ").replaceAll(".mp3", "")
            play.src = "./img/pause.svg";
        }
    })
}

const playMusic = (track) => {

    //play Frist song
    currentSong.src = `/${currFolder}` + track;
    currentSong.play();
};


async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder="${folder}" id="naat" class="card">
              <div class="play"><i class="fa-solid fa-play"></i></div>
              <img src="./songs/${folder}/cover.jpg" alt="">
              <h2>${response.title}</h2>
              <p>Hits to boost your mood and fill you with happiness</p>
            </div>`
        }
    }
     //load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}/`)

        })
    })
}


async function main() {
    await getSongs(`songs/mysongs/`);
    // console.log(songs)  

    //display all album on page
    displayAlbums()


    //  Attach an event Listener to pause play 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./img/pause.svg";
        } else if (currentSong.play) {
            play.src = "./img/play.svg";
            currentSong.pause();
        }
    });

    // listen for time update enent
    currentSong.addEventListener("timeupdate", () => {
        console.log((currentSong.currentTime, currentSong.duration));

        SongTime.innerHTML = `${secondToMinutesSeconds(
            currentSong.currentTime
        )}/ ${secondToMinutesSeconds(currentSong.duration)} `;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // listen to change the seek bar
    document.querySelector(".seek-bar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;

        let circle = document.querySelector(".circle");
        circle.style.left = percent * 100 + "%";
        circle.style.transition = "0.1s";
        currentSong.currentTime = currentSong.duration * percent;
    });

    //lister for hamgerger
    let hamburger = document.querySelector(".hamburger");
    hamburger.addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
        document.querySelectorAll(".songsList ul li img, .songsList ul li .playnow").forEach((element) => {
            element.style.display = "flex";
        });

    });

    //event for cross

    let cross = document.querySelector(".cross")
    cross.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

  

    // event for controlling the volume
    let vol = document.querySelector(".range").getElementsByTagName("input")[0]
    vol.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        console.log(e.target.value)

        if (e.target.value <= 100 && e.target.value >= 70) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume-high"></i>`
        }

        else if (e.target.value < 70 && e.target.value >= 30) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume"></i>`
        }
        else if (e.target.value >= 1 && e.target.value < 30) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume-low"></i>`
        }
        else if (e.target.value == 0) {
            document.querySelector(".vol").innerHTML = `<i class="fa-regular fa-volume-xmark"></i>`
        }
    })

   



}

main()