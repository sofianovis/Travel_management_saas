const fs = require('fs');
const files = ['auth.controller.ts', 'auth.module.ts', 'auth.service.ts', 'jwt.strategy.ts'];
files.forEach(f => {
  let s = fs.readFileSync('src/auth/' + f, 'utf8');
  s = s.replace(/from '\.\/auth\.service'/g, "from './auth.service.js'");
  s = s.replace(/from '\.\/auth\.controller'/g, "from './auth.controller.js'");
  s = s.replace(/from '\.\/jwt\.strategy'/g, "from './jwt.strategy.js'");
  s = s.replace(/from '\.\/current-user\.decorator'/g, "from './current-user.decorator.js'");
  fs.writeFileSync('src/auth/' + f, s, 'utf8');
});
