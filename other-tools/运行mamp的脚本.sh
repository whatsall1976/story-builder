#!/bin/zsh

# AppleScript to start MAMP PRO servers by clicking the menu item

applescript_code='''
tell application "MAMP PRO"
    activate -- Ensure MAMP PRO is open and active
end tell

delay 3 -- Wait for the application to open and menus to load

tell application "System Events"
    tell process "MAMP PRO"
        tell menu bar 1
            tell menu bar item "Tools"
                tell menu 1
                    click menu item "Start servers"
                end tell
            end tell
        end tell
    end tell
end tell
'''

# Execute the AppleScript using osascript
osascript -e "${applescript_code}"

# The &> /dev/null at the end redirects standard output and standard error to null,
# preventing potential verbose output from osascript itself from cluttering the chat,
# while still allowing the AppleScript dialogs/errors to appear.