#!/bin/bash
set -euo pipefail

export NEO4J_AUTH="${neo4jUsername:-neo4j}/${neo4jPassword:-neo4jpass}"
export neo4jURI=bolt://localhost:7687

/startup/docker-entrypoint.sh neo4j &

echo "Waiting for Neo4j..."
for i in $(seq 1 60); do
  if cypher-shell -u "${neo4jUsername:-neo4j}" -p "${neo4jPassword:-neo4jpass}" "RETURN 1" >/dev/null 2>&1; then
    echo "Neo4j is ready"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Neo4j failed to start"
    exit 1
  fi
  sleep 2
done

exec ./identity-service
