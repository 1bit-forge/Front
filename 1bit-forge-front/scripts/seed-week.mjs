// 一次性批次建立週行事曆事件，呼叫前端 event.js 同款 endpoint。
// 用法：node scripts/seed-week.mjs

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8000'
const ENDPOINT = '/api/calendar_core/events/create/'
const TOKEN = process.env.TOKEN

if (!TOKEN) {
    console.error('TOKEN env var is required')
    process.exit(1)
}

// 日期：8/9（週日）~ 8/15（週六），皆為 2026
const DATES = ['08-09', '08-10', '08-11', '08-12', '08-13', '08-14', '08-15']
// 時段：每段 2 小時，09:00–21:00
const SLOTS = [
    ['09:00', '11:00'],
    ['11:00', '13:00'],
    ['13:00', '15:00'],
    ['15:00', '17:00'],
    ['17:00', '19:00'],
    ['19:00', '21:00'],
]

function pickInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildEvents() {
    const events = []
    let index = 1
    for (const date of DATES) {
        for (const [start, end] of SLOTS) {
            events.push({
                title: `事件 #${String(index).padStart(2, '0')}`,
                description: '',
                startsAt: `2026-${date}T${start}:00+08:00`,
                endsAt: `2026-${date}T${end}:00+08:00`,
                priority: pickInt(1, 5),
                status: 'todo',
                isFixed: Math.random() < 0.1,
            })
            index++
        }
    }
    return events
}

async function postEvent(payload) {
    const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
    })
    const text = await res.text()
    let parsed
    try {
        parsed = JSON.parse(text)
    } catch {
        parsed = text
    }
    return { ok: res.ok, status: res.status, body: parsed }
}

async function main() {
    const events = buildEvents()
    console.log(`準備送出 ${events.length} 個事件至 ${BASE_URL}${ENDPOINT}`)

    let successCount = 0
    let failureCount = 0
    const failures = []

    for (const event of events) {
        try {
            const { ok, status, body } = await postEvent(event)
            if (ok && body?.message === 'Success') {
                successCount += 1
                console.log(`✓ ${event.title} (${event.startsAt} ~ ${event.endsAt}) priority=${event.priority} isFixed=${event.isFixed}`)
            } else {
                failureCount += 1
                failures.push({ event, status, body })
                console.error(`✗ ${event.title} status=${status}`, body)
            }
        } catch (err) {
            failureCount += 1
            failures.push({ event, error: String(err) })
            console.error(`✗ ${event.title} network error`, err)
        }
    }

    console.log('\n=== 結果 ===')
    console.log(`成功: ${successCount}`)
    console.log(`失敗: ${failureCount}`)
    if (failures.length) {
        console.log('失敗清單：', JSON.stringify(failures, null, 2))
        process.exitCode = 1
    }
}

main().catch(err => {
    console.error('執行失敗：', err)
    process.exit(1)
})