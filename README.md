# README #


### How do I publish ###

- edit the mathjs bower.json and change the 'main' from math.min.js to math.js.

- make changes
- build (this is a custom task which doesnt minify stuff)
grunt build2  
- publish
cd dist
git add .
git commit -m "updated"
git push production master

### How did I set up the server ###

On the SERVER:
- ssh xceptionale

- mkdir -p highlevel/highlevelrepo

- cd highlevel/highlevelrepo;

- git init --bare

ON My DESKTOP:
- git remote add production ssh://xceptionale/home/ubuntu/highlevel/highlevelrepo

- Using GIT push code into the AWS server


ON THE SERVER:
- Create a new hook called "post-receive" with code:
#!/bin/sh
GIT_WORK_TREE=/home/ubuntu/highlevel/www
export GIT_WORK_TREE
git checkout -f
./start.sh

- Make "post-receive" executable: chmod +x post-receive


On the SERVER:
- ssh xceptionale
- cd highlevel/www;
- Create a start script



ON My DESKTOP:
- Push some code again.

On the SERVER:
- ssh xceptionale

- cd highlevel/www;

- npm install


ON My DESKTOP:
- Push some code again.

On the SERVER:
- create a new virtual host highlevel.xceptionale.com
Point the docroot to /home/ubuntu/highlevel/www/public

Create a proxy to the nodejs server for /api calls
    ProxyPreserveHost On
    ProxyPass /api http://0.0.0.0:8887/api
    ProxyPassReverse /api http://0.0.0.0:8887/api

On the AWS:
- create a route53 alias from worldsview.xceptionale.com to the load balancer.


DONE!
