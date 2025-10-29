from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash

app = Flask(__name__)
app.secret_key = "supersecretkey"

USERNAME = "TocaImoveis"
PASSWORD = "Toca@2025@"

entries = []
next_id = 1


@app.route("/")
def home():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if username == USERNAME and password == PASSWORD:
            session["logged_in"] = True
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid credentials", "danger")
    return render_template("login.html")


@app.route("/dashboard")
def dashboard():
    if not session.get("logged_in"):
        return redirect(url_for("login"))
    total = sum(e["value"] for e in entries)
    return render_template("dashboard.html", entries=entries, total=total)


@app.route("/preview")
def preview():
    return render_template("preview.html")

@app.route("/dashboard")
def dashboard_view():  # 👈 different name
    return render_template("dashboard.html")


@app.route("/add-entry", methods=["POST"])
def add_entry():
    global next_id
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    date = data.get("date")
    value = data.get("value")
    try:
        value = float(value)
        entry = {"id": next_id, "date": date, "value": value}
        next_id += 1
        entries.append(entry)
        total = sum(e["value"] for e in entries)
        return jsonify({"success": True, "entries": entries, "total": total})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/delete-entry/<int:entry_id>", methods=["DELETE"])
def delete_entry(entry_id):
    global entries
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 403
    entries = [e for e in entries if e["id"] != entry_id]
    total = sum(e["value"] for e in entries)
    return jsonify({"success": True, "entries": entries, "total": total})


@app.route("/calculate", methods=["GET"])
def calculate():
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 403
    total = sum(e["value"] for e in entries)
    return jsonify({"total": total, "count": len(entries)})


@app.route("/clear", methods=["POST"])
def clear():
    global entries, next_id
    entries = []
    next_id = 1
    return jsonify({"success": True, "entries": [], "total": 0})


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(debug=True)
