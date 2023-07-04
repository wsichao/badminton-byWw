var
    Promise = require('promise'),
    _ = require('underscore'),
    commonUtil = require('../../lib/common-util'),
    Doctor = require('../../app/models/Doctor');
    Customer = require('../../app/models/Customer');
    DoctorService = require('../../app/services/DoctorService'),
    CustomerService = require('../../app/services/CustomerService');
/*doctor.phoneNum - > customer ?
**true, copy doctor(_id, docChatNum, realName)  to customer(doctorRef, docChatNum, name)
* false, create a customer
 */
//
//

