package middleware

import "net/http"

const internalTokenHeader = "X-Internal-Token"

func InternalAuth(serviceToken string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if serviceToken == "" || r.Header.Get(internalTokenHeader) != serviceToken {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
