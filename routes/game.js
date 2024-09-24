require('dotenv').config();
var express = require("express");
var axios = require("axios");
var router = express.Router();
const mongoose = require("mongoose");
const Country = require("../models/country"); // Import the Country model

const countries = require("../constants/contries.json");

function generateCountryDescription() {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];

    // Prepare the data for the API request
    const data = {
        contents: [
            {
                parts: [
                    {
                        text: `Descreva o país ${randomCountry.nome}, abordando pontos interessantes sobre cultura, particularidades, historia, uma pessoa influente, e outras coisas, seja breve porém que seja possivel saber, é para um jogo de perguntas, você não pode dizer o país, máximo e mínimo de 500 caracteres`,
                    },
                ],
            },
        ],
    };

    // Make the API request
    axios
        .post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_APIKEY}`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
        .then((response) => {
            const description = response.data.candidates[0].content.parts[0].text;

            const countryNew = {
                nome_pais: randomCountry.nome,
                description: description,
                code: randomCountry.codigo
            };

            Country.findOneAndUpdate(
                {}, countryNew, { upsert: true, new: true }
            )
                .then((result) => {
                    console.log("Country saved");
                    //res.send(description);  
                })
                .catch((err) => {
                    console.error("Error saving or updating country:", err);
                });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error calling the API");
        });
}

// Route to find a country by name
router.get("/find-country/:country", async (req, res) => {
    const countryName = req.params.country;

    try {
        const country = await Country.findOne({
            nome_pais: { $regex: new RegExp(`^${countryName}$`, "i") }
        });
        const sigla = countries.find(c => c.nome === countryName);


        if (!sigla){
            return res.status(500).send({ message: "Não conheço esse país, lembre-se de escrever corretamente com os acentos" });
        }


        if (!country) {
            return res.send({ country: countryName, guessedRight: false, code: sigla ? sigla.codigo : null });
        }

        res.send({ country: country.nome_pais, guessedRight: true, code: sigla.codigo });
    } catch (err) {
        console.error("Error finding country:", err);
        res.status(500).send({ message: "Não conheço esse país, lembre-se de escrever corretamente com os acentos" });
    }
});

// Route to get a random country's description
router.get("/find-country", async (req, res) => {
    try {
        const country = await Country.findOne();
        res.send({ country: country.description });
    } catch (err) {
        console.error("Error finding country:", err);
        res.status(500).send("Error finding country");
    }
});

// Export both the function and the router
module.exports = {
    generateCountryDescription,
    router
};
