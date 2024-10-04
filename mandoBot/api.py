from ninja import NinjaAPI

api = NinjaAPI()

@api.get("/hello")
def hello(request):
  return {"message": "Hello, world!"}
