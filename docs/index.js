init();

const law_legal = "✔";
const law_illegal = "✘";
const law_unknown = "?";
const research_mode = window.location.search.match(/researchMode/);


document.addEventListener("keyup", function (e) {
    if (e.key.toLowerCase() === "escape") {
        let modal = document.getElementById("infoBox");
        if (modal.style.display === "block") {
            modal.style.display = "none";
        }
    }
});
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("info")) {
        let modal = document.getElementById("infoBox");
        let h1 = modal.querySelector("h1");
        let td=e.target.closest("td");
        let colPos = td.cellIndex;
        let state = e.target.closest("tr").querySelector("td:first-child").title;
        let stateAbbreviated = e.target.closest("tr").querySelector("td:first-child").innerHTML;
        let law = document.getElementById("laws").querySelector("thead tr th:nth-child(" + (colPos+1) + ")").innerHTML;

        if (research_mode && !td.classList.contains("legal") && !td.classList.contains("illegal")) {
            e.target.target="_blank";
            e.target.href = "https://www.google.com/search?q="+encodeURIComponent(law + " in "+ state);
            return true;
        }
        h1.innerHTML = state + " : "+law;

        let asteriskNote = modal.querySelector(".asterisk-note");
        let asterisk = "";
        if (typeof e.target.dataset.asteriskNote === "undefined" || e.target.dataset.asteriskNote === "") {
            asteriskNote.style.display = "none";
        } else {
            asteriskNote.style.display = "block";
            asteriskNote.innerHTML = e.target.dataset.asteriskNote;
            asterisk = "*";
        }

        let legality = modal.querySelector(".legality");
        legality.innerHTML = "";
        let isLegal;
        if (td.classList.contains("legal")) {
            isLegal = "legal";
            let prefix = document.createElement("span");
            prefix.classList.add("legal");
            prefix.innerHTML = law_legal+" ";
            legality.appendChild(prefix);
            legality.appendChild(document.createTextNode(law + " is " + isLegal + " in " + state + asterisk))

        }
        else if (td.classList.contains("illegal")) {
            isLegal = "illegal";
            let prefix = document.createElement("span");
            prefix.classList.add("illegal");
            prefix.innerHTML = law_illegal+" ";
            legality.appendChild(prefix);
            legality.appendChild(document.createTextNode(law + " is " + isLegal + " in " + state + asterisk))

        }
        else {
            legality.innerHTML = "It is unknown whether " + law + " is legal in " + state + "." + asterisk + "<br><em>If you are able to provide information about the legality, please click the \"Add Information\" button below.</em>";
        }



        let note = modal.querySelector(".note");
        if (typeof e.target.dataset.note === "undefined" || e.target.dataset.note === "") {
            note.style.display = "none";
        } else {
            note.style.display = "block";
            note.innerHTML = e.target.dataset.note;
        }

        modal.querySelector(".add-data .feedback-state").value = stateAbbreviated;
        modal.querySelector(".add-data .feedback-law").value = law;
        modal.querySelector(".report-data .feedback-state").value = stateAbbreviated;
        modal.querySelector(".report-data .feedback-law").value = law;
        if (typeof e.target.dataset.sources !== "undefined") {
            modal.querySelector(".sources").style.display = "block";
            modal.querySelector(".general-note").style.display = "block";
            let sources = JSON.parse(decodeURIComponent(e.target.dataset.sources));

            if (sources.length === 1) {
                modal.querySelector(".sources").innerHTML = "";
                modal.querySelector(".sources").appendChild(document.createTextNode("Source : "));
                let source = document.createElement("a");
                source.innerHTML = sources[0];
                source.href = sources[0];
                source.target = "_blank";
                modal.querySelector(".sources").appendChild(source);
            }
            else {
                modal.querySelector(".sources").innerHTML = "";
                let title=document.createElement("p");
                title.innerHTML = sources.length + " Sources : ";
                modal.querySelector(".sources").appendChild(title);
                let ul = document.createElement("ol");
                for (let i in sources ) {
                    let li = document.createElement("li");
                    let sourceLink = document.createElement("a");
                    sourceLink.innerHTML = sources[i];
                    sourceLink.href = sources[i];
                    sourceLink.target = "_blank";
                    li.appendChild(sourceLink);
                    ul.appendChild(li);
                }
                modal.querySelector(".sources").appendChild(ul);
            }
            modal.querySelector(".report-data").style.display = "inline-block";
        } else {
            modal.querySelector(".sources").style.display = "none";
            modal.querySelector(".report-data").style.display = "none";
            modal.querySelector(".general-note").style.display = "none";

        }

        modal.style.display = "block";
    }
    else if (e.target.classList.contains("close-modal")) {
        let modal = document.getElementById("infoBox");
        modal.style.display = "none";
    }
});

function init() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        // dark mode
         document.documentElement.setAttribute("color-scheme", "dark");
    }
    else {
        document.documentElement.setAttribute("color-scheme", "light");
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        document.documentElement.setAttribute("color-scheme", e.matches ? "dark" : "light");
    });

    fetch("laws.json").then((response) => {
        return response.json();
    }).then((data) => {
        let table = document.getElementById("laws");
        let theadtr = table.querySelector("thead tr");
        let tbody = table.querySelector("tbody");
        for (let law of data.laws) {
            let th = document.createElement("th");
            th.innerHTML = law.title;
            theadtr.appendChild(th);
            /*
            let lawStates=Object.keys(law.states);
            for (let state of lawStates) {
                if (typeof stateLaws[state] === "undefined") {
                    stateLaws[state]={};
                }
                stateLaws[state][lawId]=law.states[state];
            }
            lawId++;
             */
        }
        for (let state of data.states) {
            let tr = document.createElement("tr");
            let stateTd = document.createElement("td");
            stateTd.innerHTML = state.abbreviation;
            stateTd.title = state.name;
            tr.appendChild(stateTd);
            for (let law of data.laws) {
                let link = document.createElement("a");
                link.classList.add("info");
                let lawTd = document.createElement("td");
                if (typeof law.states[state.abbreviation] === "undefined") {
                    link.innerHTML = law_unknown;
                } else {
                    link.dataset.note = law.states[state.abbreviation].note ?? "";
                    link.dataset.asteriskNote = law.states[state.abbreviation].asteriskNote ?? "";
                    link.dataset.sources = encodeURIComponent(JSON.stringify(law.states[state.abbreviation].sources));
                    if (law.states[state.abbreviation].legal) {
                        link.innerHTML = law_legal;
                        lawTd.classList.add("legal");
                    } else {
                        link.innerHTML = law_illegal;
                        lawTd.classList.add("illegal");
                    }
                    if (typeof law.states[state.abbreviation].asteriskNote !== "undefined" && law.states[state.abbreviation].asteriskNote !== "") {
                        link.classList.add("legal-asterisk");
                        link.title = law.states[state.abbreviation].asteriskNote;
                    }
                }
                lawTd.appendChild(link);
                tr.appendChild(lawTd);
            }
            tbody.appendChild(tr);
        }
    });
}
