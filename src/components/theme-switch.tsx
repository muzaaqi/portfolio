"use client"
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import { Moon, Sun } from 'lucide-react'

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme()
  return (
    <div className="absolute bottom-4">
      <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? 
        (<Moon />) : (<Sun />)}
      </Button>
    </div>
  )
}
