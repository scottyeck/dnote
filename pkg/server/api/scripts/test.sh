#!/bin/bash
# test.sh runs api tests. It is to be invoked by other scripts that set
# appropriate env vars.
set -eux

projectPath="$GOPATH/src/github.com/dnote/dnote"

pushd "$projectPath/pkg/server/api"
go test ./handlers/... ./operations/...  -cover -p 1 --coverprofile="$projectPath/coverage.out"
popd
