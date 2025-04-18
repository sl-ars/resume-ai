from rest_framework.renderers import JSONRenderer


class CustomJSONRenderer(JSONRenderer):
    """
    Custom JSON renderer to standardize API responses.
    Wraps all responses in a standard format: 
    {
        "success": true/false,
        "data": [response data],
        "error": null/{"message": "error message", "code": "error_code"}
    }
    """
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response_data = {}
        
        # Get response status code
        status_code = renderer_context.get('response').status_code if renderer_context else 200
        

        is_success = 200 <= status_code < 300
        

        if isinstance(data, dict) and all(k in data for k in ['success', 'data', 'error']):
            return super().render(data, accepted_media_type, renderer_context)
        
        # Format the response
        if is_success:
            response_data['success'] = True
            response_data['data'] = data
            response_data['error'] = None
        else:
            response_data['success'] = False
            response_data['data'] = None
            
            # Handle error format
            if isinstance(data, dict):
                if 'detail' in data:
                    # DRF's default error format
                    error_message = data['detail']
                    error_code = getattr(data.get('detail', None), 'code', 'error')
                    response_data['error'] = {
                        'message': error_message,
                        'code': error_code
                    }
                elif 'non_field_errors' in data:
                    # Handle validation errors that aren't tied to a specific field
                    response_data['error'] = {
                        'message': data['non_field_errors'][0],
                        'code': 'validation_error'
                    }
                else:
                    # Handle validation errors or custom error formats
                    response_data['error'] = {
                        'message': 'Validation error',
                        'code': 'validation_error',
                        'details': data
                    }
            else:
                # Generic error
                response_data['error'] = {
                    'message': data if isinstance(data, str) else 'An error occurred',
                    'code': 'error'
                }
        
        return super().render(response_data, accepted_media_type, renderer_context)