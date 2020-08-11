'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    //Cart belongsTo User
    return queryInterface.addColumn(
      'Cart', // name of Source model
      'User_id', // name of the key we're adding 
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    )
    .then(() => {
         //Images belongsTo Books
    return queryInterface.addColumn(
      'Images', // name of Source model
      'Book_id', // name of the key we're adding 
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Books', // name of Source model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    );
  }
  )
    .then(() => {
         //Cart belongsTo Books
    return queryInterface.addColumn(
      'Cart', // name of Source model
      'Book_id', // name of the key we're adding 
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Books', // name of Source model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    );
  }
  )
    .then(() => {
        //Books belongsTo User(Seller)
        return queryInterface.addColumn(
          'Books', // name of Source model
          'Seller_id', // name of the key we're adding
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'Users', // name of Target model
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          }
        ); 
      }
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Cart', // name of source model
      'User_id' // key we want to remove
    )
    .then(() => {
      return queryInterface.removeColumn(
       'Cart', // name of Source model
       'Book_id' // key we want to remove
       );
     }
    )
    .then(() => {
      return queryInterface.removeColumn(
       'Images', // name of Source model
       'Book_id' // key we want to remove
       );
     }
    )
    .then(() => {
      return queryInterface.removeColumn(
        'Books',
        'Seller_id'
      );
    }
    )
  }
};


//Cart belongsTo User
//User hasOne Cart

//Cart belongsTo Book
//Book hasMany Cart

//Book belongsTo User(Seller)
//User hasMany Book
