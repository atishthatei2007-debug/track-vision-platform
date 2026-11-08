# track-vision-platform
# TRACK VISION — Robotics Competition Platform

Track Vision is a live Line Follower competition portal with a YouTube broadcast, four ESP32/LDR laser checkpoints, organizer-only race controls, automatic timing, and a fastest-time leaderboard.

## Stack
- Next.js 15 + React + TypeScript
- Supabase Auth, PostgreSQL and Realtime
- ESP32 DevKit V1 + four analog LDR receiver channels
- OBS Studio → YouTube Live → embedded player
- Vercel hosting

## 1. Run the website locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local`.
3. Create a Supabase project.
4. In Supabase SQL Editor, run `supabase/schema.sql`.
5. Fill `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose in browser)
   - `ESP32_DEVICE_SECRET` (same secret as firmware; use a long random value)
   - `NEXT_PUBLIC_YOUTUBE_VIDEO_ID` (leave blank until a stream exists)
6. Install and run:
   ```bash
   npm install
   npm run dev
   ```
7. Open `http://localhost:3000`. Admin page: `http://localhost:3000/admin`.

## 2. Create the first administrator
1. In Supabase Dashboard → Authentication → Users, create an organizer user and confirm it.
2. Copy that user's UUID.
3. Run this SQL in Supabase SQL Editor, replacing the UUID:
   ```sql
   insert into public.admin_users(user_id)
   values ('PASTE-AUTH-USER-UUID-HERE')
   on conflict do nothing;
   ```
4. Sign in at `/admin` using that email and password.
5. Never make the `admin_users` table publicly readable or writable.

## 3. Organizer workflow
- Register teams in the Admin Control Room.
- Select the next team and press START RACE.
- The server creates one active run. The ESP32 polls `/api/device/state` and learns its run ID.
- As the robot interrupts CP1 → CP4, the ESP32 posts events to `/api/checkpoint`.
- The database validates run ID, order and duplicates, records server timestamps, and completes the run on CP4.
- The team's best time is updated only if the new valid time is faster.
- Organizer can abort an active run; aborted runs do not enter the leaderboard.

## 4. ESP32 DevKit V1 + LDR receiver wiring
This firmware uses ADC1 pins so Wi-Fi can run at the same time:
- CP1 LDR divider midpoint → GPIO32
- CP2 LDR divider midpoint → GPIO33
- CP3 LDR divider midpoint → GPIO34
- CP4 LDR divider midpoint → GPIO35
- All sensor divider grounds → ESP32 GND

A simple LDR divider example:
- 3.3V → LDR → ADC midpoint → 10kΩ resistor → GND.
- With this arrangement, light on the LDR usually increases the ADC reading; a broken beam usually lowers it, matching `BEAM_BROKEN_WHEN_BELOW = true`.
- If your actual divider is reversed, invert the setting.
- Tune `THRESHOLD[]` using the Serial Monitor with the beam aligned and interrupted. Set each threshold between the two measured ranges.
- Use a laser receiver module or comparator board designed for your optical setup if ambient light makes raw LDR readings unstable.
- Power laser emitters from a suitable regulated supply, not from ESP32 GPIO.
- Never exceed 3.3V on ESP32 analog inputs. Check the receiver output with a multimeter before connecting.

## 5. Firmware libraries
In Arduino IDE Library Manager install:
- ArduinoJson (Benoit Blanchon)

The Wi-Fi and HTTPClient libraries are included with the ESP32 Arduino core. Select the correct ESP32 Dev Module board.

Edit these values in `firmware/track_vision_esp32.ino`:
- `WIFI_SSID`
- `WIFI_PASSWORD`
- `API_BASE`
- `DEVICE_SECRET`
- `THRESHOLD[]` and `BEAM_BROKEN_WHEN_BELOW`

## 6. YouTube Live
- Create/schedule a YouTube Live event.
- In OBS, configure the YouTube stream key and start streaming.
- Copy the video ID from the YouTube watch/live URL.
- Set `NEXT_PUBLIC_YOUTUBE_VIDEO_ID` in the deployment environment and redeploy.
The site embeds YouTube's player; OBS does not stream directly into the Next.js server.

## 7. Security and timing model
- Organizer APIs require a valid Supabase Auth session AND membership in `admin_users`.
- ESP32 endpoints require `x-device-secret`. Keep this secret private and use HTTPS.
- Service-role credentials are only used server-side.
- Checkpoint events are tied to a specific active run ID, not just “whichever team is running”.
- Database enforces checkpoint sequence and one event per checkpoint per run.
- Official elapsed time is calculated from server timestamps. Network latency therefore contributes a small amount of error; for competition-grade precision, use a local timing gateway or synchronized controller timestamps and validate against a physical stopwatch.
- A lost Wi-Fi connection can cause a checkpoint event to be missed. The firmware latches each detected checkpoint and retries its HTTP event while that run remains active, even if the beam clears or Wi-Fi temporarily drops. The queue is RAM-only: a controller reboot before successful delivery can still lose a pending event. Do not use for a high-stakes final until power-loss recovery and event-day fault testing are completed.

## 8. Before event day
- Verify each receiver's voltage and polarity.
- Calibrate thresholds in the actual track lighting.
- Test each gate separately, then test all four in order.
- Test duplicate beam interruptions, wrong-order triggers, Wi-Fi dropouts, aborted runs and repeated attempts.
- Protect the Supabase service role key and ESP32 secret.
- Deploy over HTTPS and test from the actual venue Wi-Fi.
- Configure YouTube stream privacy/public visibility as intended.
- Keep a manual stopwatch and paper result sheet as backup.
