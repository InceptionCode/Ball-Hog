import { fetch } from '@remix-run/node'

import { displayDateFormat } from 'utilities/constants/date-constants'
import { formatGameDate, formatGameTime, isGameLive } from '../date-helpers'

import type { GameResults, GameStatus } from './types'
import type { GamesDTO } from './dtos'

export const mapGamesData = (gamesData: any): GamesDTO[] => {
  const mappedGamesData: GamesDTO[] = gamesData.map(
    ({ home_team, visitor_team, ...game }: any) => ({
      home_team: {
        id: home_team.id,
        fullName: home_team.full_name,
        score: game.home_team_score,
        stats: null,
      },
      visitor_team: {
        id: visitor_team.id,
        fullName: visitor_team.full_name,
        score: game.visitor_team_score,
        stats: null,
      },
      id: game.id,
      status: game.status as GameStatus | string,
      time: formatGameTime(game.time),
      date: formatGameDate(game.date, '', displayDateFormat),
    })
  )

  return mappedGamesData.sort((gameOne, gameTwo) => {
    const gameOneLive = isGameLive(gameOne)
    const gameTwoLive = isGameLive(gameTwo)

    const gameOneTime = formatGameDate(
      gameOne.date,
      gameOneLive ? '' : gameOne.status
    )
    const gameTwoTime = formatGameDate(
      gameTwo.date,
      gameTwoLive ? '' : gameTwo.status
    )

    if (gameOneTime > gameTwoTime) {
      return 1
    }

    if (gameOneTime < gameTwoTime) {
      return -1
    }

    return 0
  })
}

export const getGames = async (
  season: number,
  startDate: string,
  endDate: string
): Promise<GameResults> => {
  try {
    const gamesResponse = await fetch(
      `https://www.balldontlie.io/api/v1/games?seasons[]=${season}&start_date=${startDate}&end_date=${endDate}&per_page=100`
    )

    const gamesResponseData = await gamesResponse.json()

    // Retry recursively w/ different year
    if (gamesResponse.status === 200 && gamesResponseData.data.length === 0) {
      return getGames(season - 1, startDate, endDate)
    }

    return {
      data: mapGamesData(gamesResponseData.data),
      meta: { ...gamesResponseData.meta, season },
    }
  } catch (err) {
    console.error(err)
    return {
      data: [],
      meta: { season: String(season) },
      error: err as Error,
    }
  }
}