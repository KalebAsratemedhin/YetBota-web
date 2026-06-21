package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	identityURL := envOr("IDENTITY_URL", "http://127.0.0.1:6699")
	contentURL := envOr("CONTENT_URL", "http://127.0.0.1:9966")
	aiURL := envOr("AI_URL", "http://127.0.0.1:8989")

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	mountProxy(mux, "/proxy/main", identityURL)
	mountProxy(mux, "/proxy/content", contentURL)
	mountProxy(mux, "/proxy/ai", aiURL)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: cors(mux),
	}

	go func() {
		log.Printf("gateway listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("gateway error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	log.Println("gateway shutting down")
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mountProxy(mux *http.ServeMux, prefix, targetBase string) {
	target, err := url.Parse(targetBase)
	if err != nil {
		log.Fatalf("invalid target %s: %v", targetBase, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	originalDirector := proxy.Director
	proxy.Director = func(r *http.Request) {
		originalDirector(r)
		r.Host = target.Host
	}
	mux.Handle(prefix+"/", http.StripPrefix(prefix, proxy))
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
