async function handleDescribe() {
  if (!fields.image_url) {
    setMsg("Upload a description image first.");
    return;
  }
  try {
    setBusy(true);
    setMsg("Extracting details with AI...");

    const res = await fetch(`${API_BASE}/api/admin/ai/describe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: fields.image_url,
        price: fields.price || "",
        inventory: fields.inventory || "",
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "AI error");

    setFields((f) => ({
      ...f,
      name: data.name ?? f.name,
      category: data.category ?? f.category,
      sku: data.sku ?? f.sku,
      specs: data.specs ?? f.specs,
      description: data.description || f.description,
      price: data.price ?? f.price,
      inventory: data.inventory ?? f.inventory,
    }));

    setMsg("AI details added. Review and edit as needed.");
  } catch (e) {
    setMsg(`AI error: ${e.message}`);
  } finally {
    setBusy(false);
  }
}
