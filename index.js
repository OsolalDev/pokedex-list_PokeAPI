import express, { query } from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const BASE_URL = "https://pokeapi.co/api/v2";

app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", async (req, res) => {
    res.render("index.ejs");
});

app.post("/get-pokedex", (req, res) => {
    // GET THE WHOLE POKEDEX OF THE CHOSEN REGION
    axios.get(BASE_URL + "/pokedex/" + req.body.region)
    .then((response) => {
        let pkdxData = [];
        // FOR EACH ENTRY ON THE POKEDEX, DO THE FOLLOWING:
        for (let i = 0; i < response.data.pokemon_entries.length; i++) {
            const entry = response.data.pokemon_entries[i];
            
            // ENTRY NUMBER
            const thisEntryNumber = entry.entry_number;
            // POKEMON NAME
            const thisPokemonName = entry.pokemon_species.name;
            // SPRITE, TYPES, HEIGHT AND WEIGHT
            let thisSprite;
            let thisTypes = [];
            let typesColor = [];
            let thisHeight;
            let thisWeight;
            let pkmnData = {};
            
            // GET THE SPECIE INFO OF THIS ENTRY OF THE POKEDEX
            axios.get(entry.pokemon_species.url)
            .then((response2) => {
                // 
                console.log()
                // GET THE POKEMON INFO OF THIS ENTRY OF THE POKEDEX
                axios.get(response2.data.varieties[0].pokemon.url)
                .then((response3) => {
                    // sprite
                    thisSprite = response3.data.sprites.other["official-artwork"].front_default;

                    // types and types background color (with aux function below)
                    for (let j = 0; j < response3.data.types.length; j++) {
                        const type = response3.data.types[j].type.name;
                        thisTypes.push(type)
                        typesColor.push(getTypeColor(type));
                    }
    
                    // height
                    thisHeight = response3.data.height;
                    // weight
                    thisWeight = response3.data.weight;
    
                    // make an object with all the info
                    pkmnData = {
                        entryNumber: thisEntryNumber,
                        pkmnName: thisPokemonName,
                        pkmnSprite: thisSprite,
                        pkmnTypes: thisTypes,
                        typesColors: typesColor,
                        pkmnHeight: thisHeight,
                        pkmnWeight: thisWeight
                    }
                    // push the object into an array of entry objects
                    pkdxData.push(pkmnData);

                    // IF IT'S THE LAS ELEMENT FROM THE ARRAY LOAD THE INDEX.EJS AFTER SORTING THE ARRAY OF ENTRIES
                    if(pkdxData.length === response.data.pokemon_entries.length) {
                        pkdxData.sort(pkdxByNumber);
                        res.render("index.ejs", { pkdxData: pkdxData });
                    }

                }).catch((error3) => {
                    console.log(error3.message);
                });
                
            }).catch((error2) => {
                console.log(error2.message);
            });
        } 
    }).catch((error) => {
        console.log(error.message);
    });
});

// ADDING AN ENDPOINT WHICH GIVES YOU A RANDOM POKEMON
app.get("/random-pokemon", (req, res) => {

    const randomNumber = Math.floor(Math.random()*1281 + 1);

    axios.get(BASE_URL + "/pokemon/" + randomNumber)
    .then((response) => {
        const entry = response.data;
        // ENTRY NUMBER
        const thisEntryNumber = entry.id;
        // POKEMON NAME
        const thisPokemonName = entry.name;
        // SPRITE, TYPES, HEIGHT AND WEIGHT
        const thisSprite = entry.sprites.other["official-artwork"].front_default;
        
        let thisTypes = [];
        let typesColor = [];
        for (let i = 0; i < entry.types.length; i++) {
            const type = entry.types[i].type.name;
            thisTypes.push(type)
            typesColor.push(getTypeColor(type));
        }

        const thisHeight = entry.height;
        const thisWeight = entry.weight;

        const pkmnData = {
            entryNumber: thisEntryNumber,
            pkmnName: thisPokemonName,
            pkmnSprite: thisSprite,
            pkmnTypes: thisTypes,
            typesColors: typesColor,
            pkmnHeight: thisHeight,
            pkmnWeight: thisWeight
        };

        res.render("index.ejs", { randomPkmn: pkmnData });

    }).catch((error) => {
        console.log(error.message);
    })
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// AUXILIAR FUNCTIONS
// To get the type background color
function getTypeColor(color) {
    switch (color) {
        case "normal":
            return "background-color:#A8A878;";

        case "fire":
            return "background-color:#F08030;";

        case "water":
            return "background-color:#6890F0;";

        case "grass":
            return "background-color:#78C850;";

        case "flying":
            return "background-color:#A890F0;";

        case "fighting":
            return "background-color:#C03028;";

        case "poison":
            return "background-color:#A040A0;";

        case "electric":
            return "background-color:#F8D030;";

        case "ground":
            return "background-color:#E0C068;";

        case "rock":
            return "background-color:#B8A038;";

        case "psychic":
            return "background-color:#F85888;";

        case "ice":
            return "background-color:#98D8D8;";

        case "bug":
            return "background-color:#A8B820;";

        case "ghost":
            return "background-color:#705898;";

        case "steel":
            return "background-color:#B8B8D0;";

        case "dragon":
            return "background-color:#7038F8;";

        case "dark":
            return "background-color:#705848;";

        case "fairy":
            return 	"background-color:#EE99AC;";
    
        default:
            console.log("Something went wrong with color: " + color);
            break;
    }
}

// to sort the pokedex by the entry number
function pkdxByNumber(a, b) {
    if(a.entryNumber < b.entryNumber) {
        return -1
    }else if(a.entryNumber > b.entryNumber) {
        return 1;
    } else {
        return 0;
    }
}