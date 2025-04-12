from rest_framework.renderers import JSONRenderer
from rest_framework.utils.serializer_helpers import ReturnDict, ReturnList


class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response", None)

        if response is not None and response.exception:
            return super().render({
                "success": False,
                "error": {
                    "code": getattr(response, "status_code", 500),
                    "details": data
                }
            }, accepted_media_type, renderer_context)

        response_data = {
            "success": True,
            "data": data,
            "message": renderer_context.get("view").get_success_message(data) if hasattr(renderer_context.get("view"), "get_success_message") else ""
        }

        return super().render(response_data, accepted_media_type, renderer_context)