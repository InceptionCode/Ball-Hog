import { useEffect, useState } from 'react'

import { useSearchParams } from '@remix-run/react'

import { useTheme } from '@mui/material/styles'
import { Box, Button, TextField, Typography } from '@mui/material'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import dayjs from 'dayjs'
import { dateFormat } from 'src/utilities/constants/date-constants'

type ScheduledGamesTitleProps = { season: string }

export const ScheduledGamesTitle = ({ season }: ScheduledGamesTitleProps) => {
  const theme = useTheme()

  const [search, setSearch] = useSearchParams()
  const [dates, setDates] = useState({
    startDate: search.get('startDate'),
    endDate: search.get('endDate'),
  })

  const [isLive, setIsLive] = useState(false)

  let today: string | null

  // This is necessary to ensure we set "today" based on clients local time.
  if (typeof document !== 'undefined') {
    today = dayjs().format(dateFormat)
  }

  useEffect(() => {
    setIsLive(dates.startDate === today)
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
            rowGap: '1rem',
          },
        }}
      >
        <Typography
          align="left"
          variant="h4"
          sx={{ padding: '1rem', letterSpacing: '1.5px' }}
        >
          Scheduled Games
        </Typography>
        <Box display="flex" columnGap="1rem">
          <Button
            variant="text"
            sx={{ color: isLive ? 'red' : 'gray' }}
            onClick={() => {
              setDates({ ...dates, startDate: today })
              setIsLive(true)
              search.set('startDate', String(today))
              setSearch(search, { replace: true })
            }}
          >
            LIVE
          </Button>
          <DatePicker
            views={['day']}
            label="Start Date"
            value={dates.startDate}
            maxDate={dates.endDate}
            // NOTE: Currently assuming season start was in October. Should make this more accurate.
            minDate={`${season}-10-01`}
            onChange={(value) => {
              const selectedDate = dayjs(String(value)).format(dateFormat)

              setDates({ ...dates, startDate: selectedDate })
              setIsLive(selectedDate === today)
              search.set('startDate', selectedDate)
              setSearch(search, { replace: true })
            }}
            renderInput={(params) => (
              <TextField {...params} helperText={null} />
            )}
          />
          <DatePicker
            views={['day']}
            label="End Date"
            value={dates.endDate}
            // NOTE: Currently assuming season end was in April (June for padding). Should make this more accurate.
            maxDate={`${season + 1}-06-30`}
            minDate={dates.startDate}
            onChange={(value) => {
              const selectedDate = dayjs(String(value)).format(dateFormat)

              setDates({ ...dates, endDate: selectedDate })
              search.set('endDate', selectedDate)
              setSearch(search, { replace: true })
            }}
            renderInput={(params) => (
              <TextField {...params} helperText={null} />
            )}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  )
}
