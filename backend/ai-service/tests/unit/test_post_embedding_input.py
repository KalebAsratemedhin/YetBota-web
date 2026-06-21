import pytest
from pydantic import ValidationError

from infrastructure.temporal.workflows import PostEmbeddingInput


def test_accepts_go_capitalized_field_name() -> None:
    payload = PostEmbeddingInput.model_validate({"PostID": "abc-123"})
    assert payload.post_id == "abc-123"


def test_accepts_python_snake_case_field_name() -> None:
    payload = PostEmbeddingInput.model_validate({"post_id": "abc-123"})
    assert payload.post_id == "abc-123"


def test_rejects_missing_field() -> None:
    with pytest.raises(ValidationError):
        PostEmbeddingInput.model_validate({})


def test_is_frozen() -> None:
    payload = PostEmbeddingInput(post_id="abc")
    with pytest.raises(ValidationError):
        payload.post_id = "different"  # type: ignore[misc]
