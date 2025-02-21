package main

import (
	"log"

	"goup/ui"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	// if err := godotenv.Load(); err != nil {
	// 	log.Fatal(err)
	// }

	app := pocketbase.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
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
