import * as fs from 'fs'
import * as Cheerio from 'cheerio'
import axios from 'axios'
import { Parser } from 'json2csv'

import message from '../message.js'

interface BrazilCity {
  populacao_rank?: number
  populacao?: number
  codigo_ibge?: string
  cidade_nome?: string
  cidade_link?: string
}

export default async function getBrazilCities() {
  const wikiPediaURL = 'https://pt.wikipedia.org/wiki/Lista_de_munic%C3%ADpios_do_Brasil_por_popula%C3%A7%C3%A3o'
  const BrazilCities: BrazilCity[] = []

  try {
    const response = await axios.get(wikiPediaURL)
    const $ = Cheerio.load(response.data)
    const relatedProjectsData = $('#mw-content-text > div.mw-parser-output > table > tbody > tr')

    relatedProjectsData.each((index, element) => {
      const populationPosition = $(element).find(`td:nth-child(${1})`).text().replace('º', '')
      // https://stackoverflow.com/a/1496863
      const population = $(element)
        .find(`td:nth-child(${5})`)
        .text()
        .replace(/\u00a0/g, '')
      const codeIBGE = $(element).find(`td:nth-child(${2})`).text()
      const cityName = $(element).find(`td:nth-child(${3})`).text()
      const cityLink = $(element).find(`td:nth-child(${3}) > b > a`).attr('href')
      const cityLinkOptional = $(element).find(`td:nth-child(${3}) > a`).attr('href')

      if (index !== 0) {
        BrazilCities.push({
          populacao_rank: Number(populationPosition),
          populacao: Number(population),
          codigo_ibge: codeIBGE,
          cidade_nome: cityName,
          cidade_link: cityLink ? 'https://pt.wikipedia.org' + cityLink : 'https://pt.wikipedia.org' + cityLinkOptional,
        })
      }
    })

    // Instantiate parser.
    const parser = new Parser()

    // Parse JSON or object data to CSV.
    const csv = parser.parse(BrazilCities)

    // Add or update file.
    fs.writeFileSync('./src/files/brazil-cities.csv', csv)

    await message({
      isError: false,
      message: 'Successfully saving data. Please check the files directory.',
    })
  } catch (error: any) {
    await message({
      isError: true,
      message: `Something\'s wrong. ${error.message}`,
    })
  }
}
