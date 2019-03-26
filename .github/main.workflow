workflow "Test, Build, and Publish" {
  on = "push"
  resolves = ["Publish"]
}

action "Install Dependencies" {
  uses = "actions/npm@master"
  args = "install"
}

action "Test" {
  needs = "Install Dependencies"
  uses = "actions/npm@master"
  args = "test"
}

action "Build" {
  needs = "Test"
  uses = "actions/npm@master"
  args = "run build"
}

# Filter for a new tag
action "Tag" {
  needs = "Build"
  uses = "actions/bin/filter@master"
  args = "tag"
}

action "Publish" {
  needs = "Tag"
  uses = "actions/npm@master"
  args = "publish"
  secrets = ["NPM_AUTH_TOKEN"]
}
