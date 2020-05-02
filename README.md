# Kings Club Poker Hand Converter #
This chrome extension app is written in javascript

**IF SITE IS LAGGY, TRY AGAIN ANOTHER HOUR**

**IF ARCHIVE WON'T LOAD, TRY AGAIN ANOTHER DAY**

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
- [ ] Fix various edge cases (<0.5% freq)

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
1. Goto Archive page on kings
2. On the upper left corner of the main browser, click on the BK LOGO
3. Type in the hand numbers to start (most recent hand) and end (last hand)
4. On the archive window, right click, and click "Convert Hands"
5. **Make sure you are on the archive window when right clicking**
6. When done, click "download" (download link will appear)

**UPDATE 4/25/2020**
- [x] +50 feature is now automated
- [x] app closes if lag on site persists for 100 seconds
- [x] ONC is supported (ask for details)

**UPDATE 4/26/2020**
- [x] Fix blocked download link

**UPDATE 4/28/2020**
- [x] Capture all side pots with just 1 all-in (not available yet for ONC)
- [x] Capture most post situations (eg. CO posts)

**UPDATE 4/30/2020**
- [x] fix duplicate hand issues
- [x] grabs majority of ONC side pots (~1% error rate)

**UPDATE 5/1/2020**
- [x] allow special characters such as İ (last update crashed on several hands)

**UPDATE 5/2/2020**
- [X] fix MW showdown bug (all hands are captured)
