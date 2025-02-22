package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"goup/ui"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"golang.org/x/net/websocket"
)

type PingResult struct {
	Domain    string    `json:"domain"`
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Error     string    `json:"error,omitempty"`
	LatencyMs int64     `json:"latencyMs"`
}

var wsClients = make(map[*websocket.Conn]bool)

func wsHandler(ws *websocket.Conn) {
	wsClients[ws] = true
	log.Printf("🔌 New WebSocket client connected. Total clients: %d", len(wsClients))
	defer delete(wsClients, ws)
	defer ws.Close()
	defer log.Printf("🔌 Client disconnected. Remaining clients: %d", len(wsClients)-1)

	// Keep connection alive
	for {
		// Read message to detect disconnection
		var msg string
		if err := websocket.Message.Receive(ws, &msg); err != nil {
			break
		}
	}
}

func broadcastPingResult(result PingResult) {
	data, err := json.Marshal(result)
	if err != nil {
		log.Printf("❌ Error marshaling ping result: %v", err)
		return
	}

	for client := range wsClients {
		if err := websocket.Message.Send(client, string(data)); err != nil {
			log.Printf("❌ Error sending to client: %v", err)
			delete(wsClients, client)
			client.Close()
		}
	}
}

func ping(domain string) func() {
	return func() {
		start := time.Now()
		result := PingResult{
			Domain:    domain,
			Timestamp: time.Now(),
		}

		resp, err := http.Get("https://" + domain)
		if err != nil {
			result.Error = err.Error()
			log.Printf("❌ Error pinging %s: %v", domain, err)
		} else {
			result.Status = resp.Status
			result.LatencyMs = time.Since(start).Milliseconds()
			resp.Body.Close()
			log.Printf("✅ Successfully pinged %s - Status: %s (Latency: %dms)", domain, resp.Status, result.LatencyMs)
		}

		broadcastPingResult(result)
	}
}

func main() {
	domains := []string{"staging.api.streameth.org", "prod.api.streameth.org"}

	app := pocketbase.New()

	for _, domain := range domains {
		app.Cron().MustAdd(domain, "* * * * *", ping(domain))
		// Initial ping on startup
		go ping(domain)()
	}

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// WebSocket endpoint
		se.Router.GET("/ws", nil).BindFunc(func(e *core.RequestEvent) error {
			websocket.Handler(wsHandler).ServeHTTP(e.Response, e.Request)
			return nil
		})

		// serves static files from the provided public dir (if exists)
		se.Router.GET("/{path...}", apis.Static(ui.DistDirFS, true)).BindFunc(func(e *core.RequestEvent) error {
			if e.Request.PathValue(apis.StaticWildcardParam) != "" {
				e.Response.Header().Set("Cache-Control", "max-age=1209600 stale-while-revalidate=86400")
			}
			return e.Next()
		}).Bind(apis.Gzip())

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
