var mongoose = require('mongoose')

var Types = mongoose.Types

function isCouldbeObjectId(str) {
  if (typeof str === 'string') {
      return /^[a-f\d]{24}$/i.test(str);
  } else if (Array.isArray(str)) {
      return str.every(arrStr => /^[a-f\d]{24}$/i.test(arrStr));
  }
  return false;
}

/**
 * Converts a query of ObjectId's to $or with the string value
 * and the casted ObjectId values
 *
 *    {
 *        user: objIdStr,
 *        user1: {
 *            $in: [objIdStr, objIdStr],
 *        },
 *        subobject: {
 *            user: objIdStr,
 *            user1: {
 *                $in: [objIdStr, objIdStr],
 *            },
 *        },
 *    }
 *
 * Will be converted to:
 *
 *    {
 *        $and: [
 *            { $or: [{ user: objIdStr }, { user: objIdObj }] },
 *            {
 *                $or: [
 *                    { user1: { $in: [objIdStr, objIdStr] } },
 *                    { user1: { $in: [objIdObj, objIdObj] } },
 *                ],
 *            },
 *        ],
 *        subobject: {
 *             $and: [
 *                { $or: [{ user: objIdStr }, { user: objIdObj }] },
 *                {
 *                    $or: [
 *                        { user1: { $in: [objIdStr, objIdStr] } },
 *                        { user1: { $in: [objIdObj, objIdObj] } }
 *                    ],
 *                },
 *            ],
 *        },
 *    },
 *
 * @param {Object} query the query that will be converted
 * @return converted query
 */
function convertToObjectId$or(query) {
  /* eslint-disable no-param-reassign */
  if (typeof query !== 'object' || Array.isArray(query)) {
      return query;
  }

  return Object.keys(query).reduce((curr, subKey) => {
      if (isCouldbeObjectId(query[subKey])) {
          // Is an array of strings similar to ObjectId
          // or an string similar to ObjectId
          let multiMatch;
          const $or = [];

          multiMatch = {};
          multiMatch[subKey] = query[subKey];
          $or.push(multiMatch);

          multiMatch = {};
          multiMatch[subKey] = Array.isArray(query[subKey]) ?
              query[subKey].map(v => new Types.ObjectId(v)) :
              new Types.ObjectId(query[subKey]);
          $or.push(multiMatch);

          if (curr.$and) {
              curr.$and.push({ $or });
          } else if (curr.$or) {
              curr.$and = [{ $or: curr.$or }, { $or }];
              delete curr.$or;
          } else {
              curr.$or = $or;
          }
      } else if (typeof query[subKey] === 'object' && query[subKey].$in && isCouldbeObjectId(query[subKey].$in)) {
          // Is an array of strings similar to ObjectId
          // or an string similar to ObjectId
          let multiMatch;
          const $or = [];

          multiMatch = {};
          multiMatch[subKey] = query[subKey];
          $or.push(multiMatch);

          multiMatch = {};
          multiMatch[subKey] = {
              $in: query[subKey].$in.map(v => new Types.ObjectId(v)),
          };
          $or.push(multiMatch);

          if (curr.$and) {
              curr.$and.push({ $or });
          } else if (curr.$or) {
              curr.$and = [{ $or: curr.$or }, { $or }];
              delete curr.$or;
          } else {
              curr.$or = $or;
          }
      } else if (typeof query[subKey] === 'object' && !Array.isArray(query[subKey])) {
          curr[subKey] = convertToObjectId$or(query[subKey]);
      } else {
          curr[subKey] = query[subKey];
      }
      return curr;
  }, {});
  /* eslint-enable no-param-reassign */
}

module.exports = convertToObjectId$or