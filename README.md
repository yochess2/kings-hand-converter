# Kings Club Poker Hand Converter #
This chrome extension app is written in javascript

**Features:**
- [x] pull all hands from kingsclub
- [x] Converts the following games into Pokerstars format
  - [x] Limit Hold'em
  - [x] Omaha Hi-Lo
  - [x] No Limit Hold'em
  - [x] Pot Limit Omaha
  - [x] 2-7 Triple Draw
  - [ ] ... more to come ...

**TODO:**
- [ ] Testing
- [ ] Fix HHs with side pots and all-ins
- [ ] Fix HHs where someone posts (site does not include this line)

**Nice to have features:**
- [ ] better UI

**Download Instructions:**
1. Click "clone or download" (green button), download zip, and unzip folder
2. Open chrome and goto chrome://extensions
3. Turn on developer mode (upper right corner)
4. Click "Load unpacked" (upper left corner)
5. Look for the kings folder (SINGLE CLICK), highlight extension (SINGLE CLICK), and click select
6. Turn on the app, refresh the browser, and you're good to go

**App Instructions:**
1. Log into your Kingsclub account, click "Archive"
2. Click +50 until desired (you can spam click this, app takes care of duplicates)
3. On the upper left corner of the main browser, click on the BK LOGO
4. Type in the hand numbers to start (most recent hand) and end (last hand)
5. On the archive window, right click, and click "Convert Hands"
6. When done, click "download" (download link will appear)
7. If download is blocked, 
  - open developer tools on the archive window 
    (cmd+option+i for mac, ctrl+shift+j win), and 
  - click on console
  - copy text
  - paste into "notepad" and save as a .txt file

**UPDATE 4/25/2020**
- [x] +50 feature is now automated
- [x] app closes if lag on site persists for 100 seconds
- [x] ONC is supported (ask for details)

**UPDATE 4/26/2020**
- [x] Fix download link

**UPDATE 4/26/2020**
- [x] Capture all side pots with just 1 all-in
- [x] Capture most post situations (eg. CO posts)
