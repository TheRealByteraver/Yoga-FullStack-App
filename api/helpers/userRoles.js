const roleValues = {
  'superadmin': 500,
  'admin'     : 400,
  'coach'     : 300,
  'athlete'   : 200,
  'user'      : 100  // same as no role at all, so 'user' or '' is treated the same way
};

const roleStrings = {
  100: 'user'      ,  // same as no role at all, so 'user' or '' is treated the same way
  200: 'athlete'   ,
  300: 'coach'     ,
  400: 'admin'     ,
  500: 'superadmin'
};  

function getCleanRolesArr(rolesStr) { 
  if (!rolesStr || (typeof rolesStr !== 'string')) return [];
  const rolesArray = rolesStr.toLowerCase().split(' ').filter(roleStr => roleStr.trim().length > 0);
  return rolesArray
    // filter out non-existant roles as well as duplicates
    .filter((roleStr, index) => roleValues[roleStr] && rolesArray.indexOf(roleStr) === index)   
    // sort array, lowest valued roles first, highest last
    .sort((roleStr1, roleStr2) => roleValues[roleStr1] - roleValues[roleStr2]);
}

function getHighestRoleValue(rolesStr) {
  const userRolesArr = getCleanRolesArr(rolesStr);
  if (userRolesArr.length === 0) return 0;
  return roleValues[userRolesArr[userRolesArr.length - 1]];
}

module.exports = { roleValues, roleStrings, getCleanRolesArr, getHighestRoleValue};