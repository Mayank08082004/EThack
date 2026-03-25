from pydantic import BaseModel
from typing import Literal


class ChatHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    text: str


class StoryChatRequest(BaseModel):
    message: str
    history: list[ChatHistoryItem] = []


class StoryChatResponse(BaseModel):
    reply: str
