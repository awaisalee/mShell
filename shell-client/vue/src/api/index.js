import axios from 'axios'
import routes from '../config/api.config'

import AuthenticationService from '../authentication/authentication-service'

export const authentication = new AuthenticationService(axios, routes)

export const api = {

}
