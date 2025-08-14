from flask_restx    import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('users', description='User operations')

# Define the user model for input validation and documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Plaintext password', min_length=8)
})
user_response = api.model('UserResponse', {
    'id': fields.String(readOnly=True, description='Unique identifier of the user'),
    'first_name': fields.String(description='First name of the user'),
    'last_name': fields.String(description='Last name of the user'),
    'email': fields.String(description='Email of the user')
})


@api.route('/')
class UserList(Resource):
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    # @jwt_required()
    def post(self):
        """Register a new user"""
        user_data = api.payload
        # current_user = get_jwt_identity()
        # if not current_user.get('is_admin'):
        #     return {'error': 'Admin privileges required'}, 403

        # Simulate email uniqueness check (to be replaced by real validation with persistence)
        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 400
        try:
            new_user = facade.create_user(user_data)
            return {'id': new_user.id, 'first_name': new_user.first_name, 'last_name': new_user.last_name, 'email': new_user.email}, 201
        except Exception as e:
            return {'error': str(e)}, 400
        
@api.route('/<user_id>')
class UserResource(Resource):
    @api.marshal_with(user_response)
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID (password excluded)"""
        user = facade.get_user(user_id)
        if not user:
            api.abort(404, 'User not found')
        return user  # only fields in user_response will be serialized
    
    @api.expect(user_model)
    @api.response(200, 'User updated successfully')
    @api.response(400, 'You cannot modify email or password.')
    @api.response(403, 'Unauthorized action.')
    @api.response(404, 'User not found')
    @jwt_required()
    def put(self, user_id):
        """Update user profile information (excluding email and password)"""
        user_data = api.payload
        current_user = get_jwt_identity()
        current_user_id = current_user.get('id')
        #Check if current user is admin
        if not current_user.get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        #Check that user is modifying their own data
        if current_user_id != user_id:
            return {'error': 'Unauthorized action.'}, 403
        #Prevent email or password modification
        if 'email' in user_data or 'password' in user_data:
            return {'error': 'You cannot modify email or password.'}, 400
        #Fetch and update user
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        updated_user = facade.update_user(user_id, user_data)
        return {'message': 'User updated successfully'}, 200
    
@api.route('/user/<user_email>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_email):
        """Get user details by email"""
        user = facade.get_user_by_email(user_email)
        if not user:
            return {'error': 'User not found'}, 404
        return {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email}, 200

